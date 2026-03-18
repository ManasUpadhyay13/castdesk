import pdf from "pdf-parse/lib/pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string[]> {
  const data = await pdf(buffer);
  // Split by form feed to approximate page boundaries
  const pages = data.text.split(/\f/).filter((p: string) => p.trim().length > 0);
  return pages;
}

export async function getPdfPageCount(buffer: Buffer): Promise<number> {
  const data = await pdf(buffer);
  return data.numpages;
}
