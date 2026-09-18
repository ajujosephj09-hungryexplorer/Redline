import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Load .env.local since tsx doesn't load it automatically
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

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('OPENROUTER_API_KEY not set — skipping live analysis')
    process.exit(0)
  }

  // Dynamic import so the module resolution happens at runtime
  const { analyzeContract } = await import('../src/lib/analysis/engine')
  const { getLocalRules } = await import('../src/lib/rules/local')

  const text = readFileSync(
    join(__dirname, '../tests/fixtures/risky-contract.txt'),
    'utf8'
  )
  const rules = getLocalRules()

  console.log('Running live analysis against risky-contract.txt...\n')

  const result = await analyzeContract(text, rules)

  console.log('SUMMARY:')
  console.log(result.summary)
  console.log('')

  let citationsVerified = 0

  for (const flag of result.flags) {
    const citationPreview =
      flag.citation.length > 100
        ? flag.citation.slice(0, 100) + '...'
        : flag.citation

    console.log(`[${flag.severity.toUpperCase()}] ${flag.ruleName}`)
    console.log(`  Citation: ${citationPreview}`)

    const found = text.includes(flag.citation)
    if (found) {
      citationsVerified++
      console.log('  Citation verified: YES')
    } else {
      console.log('  Citation verified: NO — not a verbatim substring')
    }
    console.log('')
  }

  // Gaps
  if (result.gaps.length > 0) {
    console.log('GAPS:')
    for (const gap of result.gaps) {
      const explanationPreview =
        gap.explanation.length > 80
          ? gap.explanation.slice(0, 80) + '...'
          : gap.explanation
      console.log(`  [MISSING] ${gap.ruleName}: ${explanationPreview}`)
    }
    console.log('')
  }

  // Checklist
  if (result.checklist.length > 0) {
    console.log('CHECKLIST:')
    for (const item of result.checklist) {
      console.log(`  ${item.ruleName}: ${item.status}`)
    }
    console.log('')
  }

  // Summary line
  const cleanCount = result.checklist.filter((c) => c.status === 'clean').length
  console.log('---')
  console.log(`${result.flags.length} flags, ${result.gaps.length} gaps, ${cleanCount} clean`)
  console.log(
    `${citationsVerified}/${result.flags.length} citations verified as verbatim substrings`
  )

  if (citationsVerified < result.flags.length) {
    console.error('\nSome citations failed verification.')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Smoke test failed:', err)
  process.exit(1)
})
