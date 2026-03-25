/**
 * Usa o build `legacy` do pdf.js: o build padrão depende de `Uint8Array.prototype.toHex()`
 * (ES recente), ausente em vários navegadores — isso gerava "n.toHex is not a function".
 */
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return 'str' in item && typeof item.str === 'string';
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .filter(isTextItem)
      .map((item) => item.str)
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n');
}
