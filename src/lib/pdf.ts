// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export async function extractTextFromPdf(buffer: Buffer): Promise<string[]> {
  const data = await pdfParse(buffer);
  // Split by form feed or double newlines to approximate slide boundaries
  const pages = data.text.split(/\f/).filter((p: string) => p.trim().length > 0);
  return pages;
}

export async function getPdfPageCount(buffer: Buffer): Promise<number> {
  const data = await pdfParse(buffer);
  return data.numpages;
}
