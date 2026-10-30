import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { describe, it, expect } from 'vitest'

/**
 * Gold-set integrity check. No network, no model.
 *
 * Every planted sentence in the gold set must appear exactly once in its
 * document. A drifted sentence would report a recall miss the model never
 * made.
 */

interface PlantedClause {
  id: string
  clauseType: string
  sourceSentence: string
  exit: { text: string; sourceSentence: string } | null
  [key: string]: unknown
}

interface Sidecar {
  plantedClauses: PlantedClause[]
  [key: string]: unknown
}

interface ManifestEntry {
  id: string
  document: string
  sidecar: string
  benign: boolean
  unusualButHarmless: string[]
  [key: string]: unknown
}

interface Manifest {
  documents: ManifestEntry[]
  [key: string]: unknown
}

const corpusDir = join(__dirname, '..', 'eval', 'gold-set', 'corpus')
const manifest: Manifest = JSON.parse(
  readFileSync(join(corpusDir, 'manifest.json'), 'utf8')
)

function countOccurrences(text: string, sentence: string): number {
  let count = 0
  let idx = text.indexOf(sentence)
  while (idx !== -1) {
    count++
    idx = text.indexOf(sentence, idx + 1)
  }
  return count
}

describe('gold-set corpus integrity', () => {
  for (const entry of manifest.documents) {
    describe(entry.id, () => {
      const docPath = resolve(corpusDir, entry.document)
      const sidecarPath = resolve(corpusDir, entry.sidecar)
      const text = readFileSync(docPath, 'utf8')
      const sidecar: Sidecar = JSON.parse(readFileSync(sidecarPath, 'utf8'))

      if (sidecar.plantedClauses.length === 0 && entry.unusualButHarmless.length === 0) {
        it('benign document — no planted clauses to check', () => {
          expect(sidecar.plantedClauses).toHaveLength(0)
        })
      }

      for (const planted of sidecar.plantedClauses) {
        it(`${planted.id} sourceSentence appears exactly once`, () => {
          const count = countOccurrences(text, planted.sourceSentence)
          expect(count).toBe(1)
        })

        if (planted.exit?.sourceSentence) {
          it(`${planted.id} exit.sourceSentence appears exactly once`, () => {
            const count = countOccurrences(text, planted.exit!.sourceSentence)
            expect(count).toBe(1)
          })
        }
      }

      for (let i = 0; i < entry.unusualButHarmless.length; i++) {
        it(`unusualButHarmless[${i}] appears exactly once`, () => {
          const count = countOccurrences(text, entry.unusualButHarmless[i])
          expect(count).toBe(1)
        })
      }
    })
  }
})
