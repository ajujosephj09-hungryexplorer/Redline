import { readFileSync } from 'fs'
import { join } from 'path'

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

  console.log('---')
  console.log(`${result.flags.length} flags found`)
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
