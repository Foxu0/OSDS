import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import QRCode from 'qrcode';
import { getCertificateVerifyUrl } from '@/lib/appUrl';

// Certificate types supported
export type CertType = 'RECOGNITION' | 'WINNER' | 'PARTICIPATION' | 'APPRECIATION' | 'ATTENDANCE';

export interface CertificateData {
  verificationCode: string;
  recipientName: string;
  studentId?: string;                // Student number for Participation certs
  certificateType: CertType;
  eventTitle: string;
  eventDescription?: string;         // Used in certificate body text
  awardTitle?: string;               // Recognition: award/rank; Appreciation: role/topic
  competitionTitle?: string;         // Recognition: competition/category name
  issuedAt: string;                  // ISO date string
  signatoryName?: string;
  signatoryPosition?: string;
  // Legacy aliases
  studentName?: string;
  recipientIdentifier?: string;
}

// ─── Layout constants for A4 Landscape (842.25 × 597.75 pt) ───────────────────
// Content area starts at x≈130 (after left decorative band) to x≈800
// Y: 0 = bottom, 597 = top. Left decorative band uses x 0–120.
const CX = 420;   // center X of content area
const ML = 130;   // left margin of text area
const MR = 800;   // right margin of text area
const TW = MR - ML; // text width

/**
 * Center-align text helper: returns x so text appears centered between ML and MR
 */
function centerX(text: string, fontSize: number, font: any): number {
  const w = font.widthOfTextAtSize(text, fontSize);
  return ML + (TW - w) / 2;
}

/**
 * Wrap text into lines fitting within maxWidth, returning array of strings.
 */
function wrapText(text: string, fontSize: number, font: any, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Generates a certificate PDF using the official URS Cainta e-cert template.
 * 
 * Strategy:
 *  1. Load Page 1 of ecert.pdf (clean background — URS logo + decorative borders)
 *  2. Copy it into a new single-page document
 *  3. Overlay all dynamic content programmatically
 *  4. Embed QR code pointing to /verify/[verificationCode]
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  // ── 1. Load template background (Page 1 of ecert.pdf) ──────────────────────
  let pdfDoc: PDFDocument;
  let templateLoaded = false;

  try {
    let templateBytes: ArrayBuffer | null = null;

    if (typeof window !== 'undefined') {
      // Client-side: fetch from public/
      const paths = ['/templates/ecert.pdf', '/templates/default_template.pdf'];
      for (const p of paths) {
        const res = await fetch(p);
        if (res.ok) { templateBytes = await res.arrayBuffer(); break; }
      }
    } else {
      // Server-side: read from filesystem
      const fs = require('fs') as typeof import('fs');
      const path = require('path') as typeof import('path');
      const candidates = [
        path.join(process.cwd(), 'public', 'templates', 'ecert.pdf'),
        path.join(process.cwd(), 'public', 'templates', 'default_template.pdf'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          templateBytes = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
          break;
        }
      }
    }

    if (templateBytes) {
      // Load the full template, extract just Page 1 (clean background)
      const templateDoc = await PDFDocument.load(templateBytes);
      pdfDoc = await PDFDocument.create();
      const [copiedPage] = await pdfDoc.copyPages(templateDoc, [0]); // Page index 0 = Page 1
      pdfDoc.addPage(copiedPage);
      templateLoaded = true;
    } else {
      throw new Error('Template not found');
    }
  } catch (e) {
    console.warn('[pdfGenerator] Could not load template, using blank fallback:', e);
    pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 598]);
    // Draw basic URS-colored border on fallback
    page.drawRectangle({
      x: 20, y: 20,
      width: 802, height: 558,
      borderWidth: 3,
      borderColor: rgb(0.05, 0.12, 0.45),
      color: rgb(0.99, 0.99, 1.0),
    });
  }

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  // ── 2. Embed fonts ──────────────────────────────────────────────────────────
  const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontMono    = await pdfDoc.embedFont(StandardFonts.Courier);

  // ── 3. Determine certificate type and build body text ──────────────────────
  const recipientName = (data.recipientName || data.studentName || 'Recipient').trim();
  const isRecognition  = data.certificateType === 'RECOGNITION' || data.certificateType === 'WINNER';
  const isParticipation = data.certificateType === 'PARTICIPATION' || data.certificateType === 'ATTENDANCE';
  const isAppreciation  = data.certificateType === 'APPRECIATION';

  // Certificate title line 2 (the TYPE word)
  let certTypeWord = 'PARTICIPATION';
  if (isRecognition)  certTypeWord = 'RECOGNITION';
  if (isAppreciation) certTypeWord = 'APPRECIATION';

  // Intro line
  let introText = 'This is to certify that';
  if (isRecognition)  introText = 'This certificate is presented to';
  if (isAppreciation) introText = 'With heartfelt gratitude, this certificate is presented to';

  // Body description lines (built per type)
  const bodyLines: Array<{ text: string; bold?: boolean; italic?: boolean }> = [];

  if (isRecognition) {
    const award = data.awardTitle || 'Outstanding Achievement';
    const comp  = data.competitionTitle || data.eventTitle;
    bodyLines.push({ text: 'for achieving', italic: true });
    bodyLines.push({ text: award, bold: true });
    bodyLines.push({ text: 'in', italic: true });
    bodyLines.push({ text: comp, bold: true });
  } else if (isParticipation) {
    const studentId = data.studentId || data.recipientIdentifier;
    if (studentId && studentId !== 'Winner' && studentId !== 'Guest Keynote Speaker') {
      bodyLines.push({ text: `Student ID: ${studentId}`, italic: true });
    }
    bodyLines.push({ text: 'for actively participating in', italic: true });
    bodyLines.push({ text: data.eventTitle, bold: true });
    if (data.eventDescription) {
      bodyLines.push({ text: data.eventDescription });
    }
  } else if (isAppreciation) {
    const role  = data.awardTitle || 'Distinguished Contributor';
    bodyLines.push({ text: 'for outstanding contribution as', italic: true });
    bodyLines.push({ text: role, bold: true });
    bodyLines.push({ text: 'for the event', italic: true });
    bodyLines.push({ text: data.eventTitle, bold: true });
  }

  // Formatted date
  const issueDateFormatted = new Date(data.issuedAt).toLocaleDateString('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── 4. Color palette ────────────────────────────────────────────────────────
  const navyBlue  = rgb(0.047, 0.122, 0.455);  // URS navy
  const goldColor = rgb(0.72, 0.49, 0.06);      // URS gold
  const darkGray  = rgb(0.20, 0.22, 0.28);
  const midGray   = rgb(0.42, 0.45, 0.52);
  const black     = rgb(0.08, 0.08, 0.10);

  // ── 5. Draw content (top → bottom) ─────────────────────────────────────────

  // 5a. University Header ─────────────────────────────────────────────────────
  // Skip if template already has it; still draw for fallback and positioning clarity
  if (!templateLoaded) {
    page.drawText('UNIVERSITY OF RIZAL SYSTEM', {
      x: centerX('UNIVERSITY OF RIZAL SYSTEM', 13, fontBold),
      y: height - 68,
      size: 13, font: fontBold, color: navyBlue,
    });
    page.drawText('Cainta Campus', {
      x: centerX('Cainta Campus', 10, fontItalic),
      y: height - 84,
      size: 10, font: fontItalic, color: darkGray,
    });
  }

  // 5b. "Certificate of" label ─────────────────────────────────────────────────
  const certOfText = 'Certificate of';
  page.drawText(certOfText, {
    x: centerX(certOfText, 16, fontItalic),
    y: height - 145,
    size: 16, font: fontItalic, color: darkGray,
  });

  // 5c. Certificate TYPE (large, bold, navy) ───────────────────────────────────
  const typeFontSize = certTypeWord.length > 14 ? 30 : 36;
  page.drawText(certTypeWord, {
    x: centerX(certTypeWord, typeFontSize, fontBold),
    y: height - 190,
    size: typeFontSize, font: fontBold, color: navyBlue,
  });

  // 5d. Thin gold divider line ─────────────────────────────────────────────────
  page.drawLine({
    start: { x: ML + 60, y: height - 205 },
    end:   { x: MR - 60, y: height - 205 },
    thickness: 1,
    color: goldColor,
    opacity: 0.8,
  });

  // 5e. Intro text ─────────────────────────────────────────────────────────────
  const introWrapped = wrapText(introText, 12, fontItalic, TW - 80);
  let curY = height - 230;
  for (const line of introWrapped) {
    page.drawText(line, {
      x: centerX(line, 12, fontItalic),
      y: curY,
      size: 12, font: fontItalic, color: darkGray,
    });
    curY -= 18;
  }

  // 5f. Recipient Name (large, navy, bold) ─────────────────────────────────────
  curY -= 8;
  const nameFontSize = recipientName.length > 36 ? 22 : recipientName.length > 26 ? 26 : 30;
  const nameUpper = recipientName.toUpperCase();
  page.drawText(nameUpper, {
    x: centerX(nameUpper, nameFontSize, fontBold),
    y: curY,
    size: nameFontSize, font: fontBold, color: navyBlue,
  });
  curY -= (nameFontSize + 4);

  // Underline beneath recipient name
  const nameWidth = fontBold.widthOfTextAtSize(nameUpper, nameFontSize);
  const nameX = centerX(nameUpper, nameFontSize, fontBold);
  page.drawLine({
    start: { x: nameX, y: curY + 2 },
    end:   { x: nameX + nameWidth, y: curY + 2 },
    thickness: 1.5,
    color: navyBlue,
    opacity: 0.6,
  });
  curY -= 14;

  // 5g. Body description lines ─────────────────────────────────────────────────
  for (const lineData of bodyLines) {
    const maxW = TW - 60;
    const lineFont = lineData.bold ? fontBold : lineData.italic ? fontItalic : fontReg;
    const lineColor = lineData.bold ? black : midGray;
    const lineFontSize = lineData.bold ? 13 : 12;

    const wrapped = wrapText(lineData.text, lineFontSize, lineFont, maxW);
    for (const wl of wrapped) {
      page.drawText(wl, {
        x: centerX(wl, lineFontSize, lineFont),
        y: curY,
        size: lineFontSize, font: lineFont, color: lineColor,
      });
      curY -= (lineFontSize + 5);
    }
    curY -= 4; // extra spacing between body segments
  }

  // 5h. Date line ──────────────────────────────────────────────────────────────
  curY -= 8;
  const dateText = isParticipation
    ? `Held on ${issueDateFormatted}, at URS Cainta Campus`
    : `Given this ${issueDateFormatted}, at URS Cainta Campus`;
  const dateWrapped = wrapText(dateText, 11, fontItalic, TW - 60);
  for (const dl of dateWrapped) {
    page.drawText(dl, {
      x: centerX(dl, 11, fontItalic),
      y: curY,
      size: 11, font: fontItalic, color: midGray,
    });
    curY -= 16;
  }

  // 5i. Signatory section (left-aligned in center area) ───────────────────────
  const signatoryName     = data.signatoryName || 'Campus Director';
  const signatoryPosition = data.signatoryPosition || '';
  const sigX = ML + 60;
  const sigY = 105;

  // Signature line
  page.drawLine({
    start: { x: sigX, y: sigY + 26 },
    end:   { x: sigX + 200, y: sigY + 26 },
    thickness: 1.2,
    color: darkGray,
  });

  page.drawText(signatoryName, {
    x: sigX,
    y: sigY + 10,
    size: 10, font: fontBold, color: black,
  });

  if (signatoryPosition) {
    const posWrapped = wrapText(signatoryPosition, 9, fontItalic, 220);
    let py = sigY - 4;
    for (const pl of posWrapped) {
      page.drawText(pl, {
        x: sigX,
        y: py,
        size: 9, font: fontItalic, color: midGray,
      });
      py -= 13;
    }
  }

  // 5j. Verification code (bottom left) ───────────────────────────────────────
  const verifyUrl = getCertificateVerifyUrl(data.verificationCode);
  const codeLabel = `Verification Code: ${data.verificationCode}`;

  page.drawText(codeLabel, {
    x: 44,
    y: 44,
    size: 8, font: fontMono, color: navyBlue,
  });
  page.drawText(`Verify at: ${verifyUrl}`, {
    x: 44,
    y: 30,
    size: 7, font: fontReg, color: midGray,
  });

  // 5k. QR Code (bottom right) ─────────────────────────────────────────────────
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 180,
      errorCorrectionLevel: 'M',
      color: { dark: '#0C1E72', light: '#FFFFFF' },
    });
    const qrPngBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrPngBytes);
    const qrSize = 72;
    page.drawImage(qrImage, {
      x: width - qrSize - 28,
      y: 20,
      width: qrSize,
      height: qrSize,
    });
  } catch (qrErr) {
    console.error('[pdfGenerator] QR code embedding failed:', qrErr);
  }

  // ── 6. Save and return ──────────────────────────────────────────────────────
  return pdfDoc.save();
}
