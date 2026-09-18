/**
 * Browser-side document parsing.
 * Accepts .txt, .pdf, and .docx files and returns plain text.
 * No files leave the browser — only extracted text is stored.
 */

// ---------------------------------------------------------------------------
// Plain text / paste input
// ---------------------------------------------------------------------------

export function parseText(
  text: string,
  title?: string
): { title: string; text: string } {
  if (!text || !text.trim()) {
    throw new Error('The pasted text is empty. Paste the contract text and try again.')
  }

  const resolvedTitle =
    title?.trim() ||
    text.trim().split('\n')[0].trim().slice(0, 120) ||
    'Pasted document'

  return { title: resolvedTitle, text }
}

// ---------------------------------------------------------------------------
// File-based parsing (.txt, .pdf, .docx)
// ---------------------------------------------------------------------------

export async function parseDocument(
  file: File
): Promise<{ title: string; text: string }> {
  const name = file.name
  const ext = name.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'txt':
      return parseTxt(file)
    case 'pdf':
      return parsePdf(file)
    case 'docx':
      return parseDocx(file)
    default:
      throw new Error(
        `"${name}" is not a supported file type. Upload a .txt, .pdf, or .docx file.`
      )
  }
}

// ---------------------------------------------------------------------------
// .txt
// ---------------------------------------------------------------------------

async function parseTxt(file: File): Promise<{ title: string; text: string }> {
  const text = await file.text()
  if (!text.trim()) {
    throw new Error('The file is empty. Choose a file that contains contract text.')
  }
  return { title: file.name, text }
}

// ---------------------------------------------------------------------------
// .pdf  — uses pdfjs-dist, rejects scanned (image-only) PDFs
// ---------------------------------------------------------------------------

async function parsePdf(file: File): Promise<{ title: string; text: string }> {
  const pdfjsLib = await import('pdfjs-dist')

  // Set worker source for browser environment
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items
      .filter((item) => 'str' in item)
      .map((item) => (item as { str: string }).str)
    pages.push(strings.join(' '))
  }

  const text = pages.join('\n').trim()

  if (!text) {
    throw new Error(
      'This PDF appears to be scanned or image-only. Redline cannot read scanned documents — upload a text-based PDF, .docx, or .txt file instead.'
    )
  }

  return { title: file.name, text }
}

// ---------------------------------------------------------------------------
// .docx — uses mammoth to extract raw text
// ---------------------------------------------------------------------------

async function parseDocx(file: File): Promise<{ title: string; text: string }> {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  const text = result.value.trim()

  if (!text) {
    throw new Error('The .docx file has no readable text. Choose a different file.')
  }

  return { title: file.name, text }
}
