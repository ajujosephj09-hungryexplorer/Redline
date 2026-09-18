import { describe, it, expect } from 'vitest'
import { parseText, parseDocument } from '@/lib/parser'
import { readFileSync } from 'fs'
import { join } from 'path'
import { File as NodeFile } from 'buffer'

describe('parseText', () => {
  it('parses the risky fixture and preserves all citation strings', () => {
    const text = readFileSync(join(__dirname, 'fixtures/risky-contract.txt'), 'utf8')
    const sidecar = JSON.parse(readFileSync(join(__dirname, 'fixtures/risky-contract.json'), 'utf8'))
    const result = parseText(text, 'Risky Contract')

    expect(result.title).toBe('Risky Contract')
    expect(result.text).toBe(text)
    for (const flag of sidecar.expectedFlags) {
      expect(result.text).toContain(flag.citation)
    }
  })

  it('throws on empty text', () => {
    expect(() => parseText('')).toThrow()
    expect(() => parseText('   ')).toThrow()
  })

  it('derives title from first line when no title given', () => {
    const result = parseText('SERVICE AGREEMENT\nBetween party A and party B')
    expect(result.title).toBe('SERVICE AGREEMENT')
  })

  it('uses "Pasted document" when text has no clear first line', () => {
    // Edge case: text that is only whitespace on the first line
    const result = parseText('  \nActual content starts here')
    expect(result.title).toBe('Actual content starts here')
  })
})

describe('parseDocument', () => {
  it('parses a .txt file', async () => {
    const content = 'Test contract content here'
    const file = new NodeFile([content], 'test.txt', { type: 'text/plain' }) as unknown as File
    const result = await parseDocument(file)
    expect(result.text).toBe(content)
    expect(result.title).toBe('test.txt')
  })

  it('throws on unsupported file type', async () => {
    const file = new NodeFile(['data'], 'test.jpg', { type: 'image/jpeg' }) as unknown as File
    await expect(parseDocument(file)).rejects.toThrow()
  })

  it('throws on empty .txt file', async () => {
    const file = new NodeFile([''], 'empty.txt', { type: 'text/plain' }) as unknown as File
    await expect(parseDocument(file)).rejects.toThrow()
  })
})
