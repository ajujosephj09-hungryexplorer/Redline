import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname, resolve } from 'path'

// ---------------------------------------------------------------------------
// Load .env.local (same approach as smoke.ts)
// ---------------------------------------------------------------------------
const envPath = join(__dirname, '..', '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    const val = trimmed.slice(eq + 1)
    if (!process.env[key]) process.env[key] = val
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlantedClause {
  id: string
  clauseType: string
  sourceSentence: string
  expectedSeverityBand: string
  confidence: number
  consequence: string
  exit: { text: string; sourceSentence: string } | null
  why: string
}

interface Sidecar {
  document: string
  title: string
  sourceKind: string
  checkedClauseTypes: string[]
  summary: string
  plantedClauses: PlantedClause[]
}

interface ManifestEntry {
  id: string
  document: string
  sidecar: string
  provenance: string
  benign: boolean
  unusualButHarmless: string[]
  questions?: string
}

interface Manifest {
  corpus: string
  version: number
  whatThisIs: string
  documents: ManifestEntry[]
}

interface FlagResult {
  document: string
  documentId: string
  ruleName: string
  severity: string
  citation: string
  problem: string
  counterOffer: string
  isGrounded: boolean
  matchedPlantedClause: string | null
  matchedClauseType: string | null
  typeCorrect: boolean | null
}

// ---------------------------------------------------------------------------
// Clause type mapping: gold-set type → Redline rule name
// ---------------------------------------------------------------------------

const CLAUSE_TYPE_MAP: Record<string, string> = {
  'arbitration-and-class-action-waiver': 'Forced Arbitration + Class Action Waiver',
  'non-compete': 'Non-Compete',
  'indemnification': 'Indemnification (overbroad)',
  'fee-escalators-and-late-fees': 'Payment Terms (unfavorable)',
}

const OUT_OF_SCOPE_TYPES = new Set([
  'limitation-of-liability',
  'auto-renewal',
  'unilateral-modification',
])

// ---------------------------------------------------------------------------
// Special character detection
// ---------------------------------------------------------------------------

const SPECIAL_CHAR_PATTERNS: Record<string, RegExp> = {
  'curly quote/apostrophe': /[\u2018\u2019\u201C\u201D]/,
  'non-breaking space': /\u00A0/,
  'fi/fl ligature': /[\uFB01\uFB02]/,
  'em dash': /\u2014/,
  'double space': /  /,
}

function detectSpecialChars(s: string): string[] {
  const found: string[] = []
  for (const [name, pattern] of Object.entries(SPECIAL_CHAR_PATTERNS)) {
    if (pattern.test(s)) found.push(name)
  }
  return found
}

function hasSpecialChars(s: string): boolean {
  return detectSpecialChars(s).length > 0
}

// ---------------------------------------------------------------------------
// Overlap detection
// ---------------------------------------------------------------------------

const OVERLAP_THRESHOLD = 40

function sentencesOverlap(a: string, b: string): boolean {
  if (a.includes(b) || b.includes(a)) return true
  // Check for shared run of OVERLAP_THRESHOLD+ characters
  const shorter = a.length <= b.length ? a : b
  const longer = a.length > b.length ? a : b
  for (let i = 0; i <= shorter.length - OVERLAP_THRESHOLD; i++) {
    const chunk = shorter.slice(i, i + OVERLAP_THRESHOLD)
    if (longer.includes(chunk)) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('OPENROUTER_API_KEY not set — skipping eval')
    process.exit(0)
  }

  const runStart = new Date()
  const timestamp = runStart.toISOString().replace(/[:.]/g, '-')

  // Dynamic import so module resolution happens at runtime
  const { analyzeContract } = await import('../src/lib/analysis/engine')
  const { getLocalRules } = await import('../src/lib/rules/local')

  const rules = getLocalRules()
  const corpusDir = join(__dirname, '..', 'eval', 'gold-set', 'corpus')
  const manifest: Manifest = JSON.parse(
    readFileSync(join(corpusDir, 'manifest.json'), 'utf8')
  )

  const allFlags: FlagResult[] = []
  let totalInScopePlanted = 0
  let totalInScopeFound = 0
  let totalInScopeFoundWithSpecial = 0
  let totalInScopeWithSpecial = 0
  let totalInScopeFoundWithoutSpecial = 0
  let totalInScopeWithoutSpecial = 0
  let totalGrounded = 0
  let totalFlagsReturned = 0
  let totalCleanDocFlags = 0
  let totalBenignDocs = 0
  let documentsSkipped = 0
  let totalTypeCorrect = 0
  let totalTypeChecked = 0

  const perDocument: Array<{
    id: string
    title: string
    benign: boolean
    skipped: boolean
    error?: string
    flagCount: number
    plantedInScope: number
    plantedFound: number
    groundedFlags: number
    totalFlags: number
  }> = []

  for (const entry of manifest.documents) {
    const docPath = resolve(corpusDir, entry.document)
    const sidecarPath = resolve(corpusDir, entry.sidecar)

    if (!existsSync(docPath)) {
      console.error(`Document not found: ${docPath}`)
      documentsSkipped++
      perDocument.push({
        id: entry.id,
        title: entry.id,
        benign: entry.benign,
        skipped: true,
        error: 'Document file not found',
        flagCount: 0,
        plantedInScope: 0,
        plantedFound: 0,
        groundedFlags: 0,
        totalFlags: 0,
      })
      continue
    }

    const text = readFileSync(docPath, 'utf8')
    const sidecar: Sidecar = JSON.parse(readFileSync(sidecarPath, 'utf8'))

    console.log(`Analyzing: ${entry.id} (${sidecar.title})...`)

    let result
    try {
      result = await analyzeContract(text, rules)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  FAILED: ${msg}`)
      documentsSkipped++
      perDocument.push({
        id: entry.id,
        title: sidecar.title,
        benign: entry.benign,
        skipped: true,
        error: msg,
        flagCount: 0,
        plantedInScope: 0,
        plantedFound: 0,
        groundedFlags: 0,
        totalFlags: 0,
      })
      continue
    }

    // Process flags
    let docGrounded = 0
    let docFlagsTotal = result.flags.length
    totalFlagsReturned += docFlagsTotal

    for (const flag of result.flags) {
      const grounded = text.includes(flag.citation)
      if (grounded) {
        docGrounded++
        totalGrounded++
      }

      // Try to match against planted clauses
      let matchedPlanted: string | null = null
      let matchedType: string | null = null
      let typeCorrect: boolean | null = null

      for (const planted of sidecar.plantedClauses) {
        if (sentencesOverlap(flag.citation, planted.sourceSentence)) {
          matchedPlanted = planted.id
          matchedType = planted.clauseType

          // Check type correctness
          const expectedRuleName = CLAUSE_TYPE_MAP[planted.clauseType]
          if (expectedRuleName) {
            typeCorrect = flag.ruleName === expectedRuleName
            totalTypeChecked++
            if (typeCorrect) totalTypeCorrect++
          }
          break
        }
      }

      allFlags.push({
        document: entry.id,
        documentId: entry.id,
        ruleName: flag.ruleName,
        severity: flag.severity,
        citation: flag.citation,
        problem: flag.problem,
        counterOffer: flag.counterOffer,
        isGrounded: grounded,
        matchedPlantedClause: matchedPlanted,
        matchedClauseType: matchedType,
        typeCorrect,
      })
    }

    // Count in-scope planted clauses found
    const inScopePlanted = sidecar.plantedClauses.filter(
      (p) => !OUT_OF_SCOPE_TYPES.has(p.clauseType)
    )
    let docFound = 0

    for (const planted of inScopePlanted) {
      const special = hasSpecialChars(planted.sourceSentence)
      if (special) totalInScopeWithSpecial++
      else totalInScopeWithoutSpecial++

      const found = result.flags.some((f) =>
        sentencesOverlap(f.citation, planted.sourceSentence)
      )
      if (found) {
        docFound++
        if (special) totalInScopeFoundWithSpecial++
        else totalInScopeFoundWithoutSpecial++
      }
    }

    totalInScopePlanted += inScopePlanted.length
    totalInScopeFound += docFound

    // Clean document check
    if (entry.benign) {
      totalBenignDocs++
      totalCleanDocFlags += docFlagsTotal
    }

    perDocument.push({
      id: entry.id,
      title: sidecar.title,
      benign: entry.benign,
      skipped: false,
      flagCount: docFlagsTotal,
      plantedInScope: inScopePlanted.length,
      plantedFound: docFound,
      groundedFlags: docGrounded,
      totalFlags: docFlagsTotal,
    })

    console.log(
      `  ${docFlagsTotal} flags, ${docGrounded}/${docFlagsTotal} grounded, ${docFound}/${inScopePlanted.length} in-scope planted found`
    )
  }

  // ---------------------------------------------------------------------------
  // Compute rates
  // ---------------------------------------------------------------------------

  const pct = (n: number, d: number) =>
    d === 0 ? 'N/A' : `${n}/${d} (${((n / d) * 100).toFixed(1)}%)`

  const recallStr = pct(totalInScopeFound, totalInScopePlanted)
  const groundednessStr = pct(totalGrounded, totalFlagsReturned)
  const cleanStr = `${totalCleanDocFlags} flags on ${totalBenignDocs} benign documents`
  const typeStr = pct(totalTypeCorrect, totalTypeChecked)
  const recallSpecialStr = pct(totalInScopeFoundWithSpecial, totalInScopeWithSpecial)
  const recallNoSpecialStr = pct(
    totalInScopeFoundWithoutSpecial,
    totalInScopeWithoutSpecial
  )

  // ---------------------------------------------------------------------------
  // Print summary
  // ---------------------------------------------------------------------------

  const lines: string[] = []
  lines.push('========================================')
  lines.push('EVAL RUN SUMMARY')
  lines.push(`Started: ${runStart.toISOString()}`)
  lines.push(`Model: ${process.env.OPENROUTER_MODEL}`)
  lines.push('========================================')
  lines.push('')
  lines.push(`Documents in corpus: ${manifest.documents.length}`)
  lines.push(`Documents skipped (failed calls): ${documentsSkipped}`)
  lines.push(`Documents evaluated: ${manifest.documents.length - documentsSkipped}`)
  lines.push('')
  lines.push('--- RECALL (in-scope planted clauses) ---')
  lines.push(`Overall: ${recallStr}`)
  lines.push(`With special characters: ${recallSpecialStr}`)
  lines.push(`Without special characters: ${recallNoSpecialStr}`)
  lines.push('')
  lines.push('--- GROUNDEDNESS ---')
  lines.push(`Flags with verbatim citations: ${groundednessStr}`)
  lines.push('')
  lines.push('--- CLEAN DOCUMENTS ---')
  lines.push(cleanStr)
  lines.push('')
  lines.push('--- TYPE CORRECTNESS ---')
  lines.push(`Matched flags with correct rule name: ${typeStr}`)
  lines.push('')
  lines.push('--- PER DOCUMENT ---')
  for (const doc of perDocument) {
    if (doc.skipped) {
      lines.push(`  ${doc.id}: SKIPPED (${doc.error})`)
    } else {
      lines.push(
        `  ${doc.id}: ${doc.totalFlags} flags, ${doc.groundedFlags}/${doc.totalFlags} grounded, ${doc.plantedFound}/${doc.plantedInScope} in-scope recall${doc.benign ? ' [BENIGN]' : ''}`
      )
    }
  }
  lines.push('')
  lines.push('--- OUT OF SCOPE TYPES (never counted as misses) ---')
  lines.push('  limitation-of-liability')
  lines.push('  auto-renewal')
  lines.push('  unilateral-modification')

  const summary = lines.join('\n')
  console.log('\n' + summary)

  // ---------------------------------------------------------------------------
  // Save results
  // ---------------------------------------------------------------------------

  const runsDir = join(__dirname, '..', 'eval-runs')
  if (!existsSync(runsDir)) mkdirSync(runsDir, { recursive: true })

  const txtPath = join(runsDir, `${timestamp}.txt`)
  const jsonPath = join(runsDir, `${timestamp}.json`)

  writeFileSync(txtPath, summary, 'utf8')

  const jsonResult = {
    runStart: runStart.toISOString(),
    model: process.env.OPENROUTER_MODEL,
    documentsInCorpus: manifest.documents.length,
    documentsSkipped,
    documentsEvaluated: manifest.documents.length - documentsSkipped,
    recall: {
      found: totalInScopeFound,
      total: totalInScopePlanted,
      rate: totalInScopePlanted > 0 ? totalInScopeFound / totalInScopePlanted : null,
    },
    recallWithSpecialChars: {
      found: totalInScopeFoundWithSpecial,
      total: totalInScopeWithSpecial,
      rate:
        totalInScopeWithSpecial > 0
          ? totalInScopeFoundWithSpecial / totalInScopeWithSpecial
          : null,
    },
    recallWithoutSpecialChars: {
      found: totalInScopeFoundWithoutSpecial,
      total: totalInScopeWithoutSpecial,
      rate:
        totalInScopeWithoutSpecial > 0
          ? totalInScopeFoundWithoutSpecial / totalInScopeWithoutSpecial
          : null,
    },
    groundedness: {
      grounded: totalGrounded,
      total: totalFlagsReturned,
      rate: totalFlagsReturned > 0 ? totalGrounded / totalFlagsReturned : null,
    },
    cleanDocuments: {
      benignDocCount: totalBenignDocs,
      flagsOnBenignDocs: totalCleanDocFlags,
    },
    typeCorrectness: {
      correct: totalTypeCorrect,
      checked: totalTypeChecked,
      rate: totalTypeChecked > 0 ? totalTypeCorrect / totalTypeChecked : null,
    },
    outOfScopeTypes: ['limitation-of-liability', 'auto-renewal', 'unilateral-modification'],
    perDocument,
    flags: allFlags,
  }

  writeFileSync(jsonPath, JSON.stringify(jsonResult, null, 2), 'utf8')

  console.log(`\nResults saved to:`)
  console.log(`  ${txtPath}`)
  console.log(`  ${jsonPath}`)
}

main().catch((err) => {
  console.error('Eval failed:', err)
  process.exit(1)
})
