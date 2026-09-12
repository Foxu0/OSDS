import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { getCertificateVerifyUrl } from '@/lib/appUrl';

// Supported certificate types
export type CertType = 'RECOGNITION' | 'WINNER' | 'PARTICIPATION' | 'APPRECIATION' | 'ATTENDANCE';

export interface CertificateData {
  verificationCode: string;
  recipientName: string;
  studentId?: string;
  certificateType: CertType;
  eventTitle: string;
  eventDescription?: string;
  awardTitle?: string;
  competitionTitle?: string;
  eventDate?: string;
  issuedAt: string;
  signatoryName?: string;
  signatoryPosition?: string;
  templateRef?: string;
  // Legacy aliases
  studentName?: string;
  recipientIdentifier?: string;
}

// ─── Dimensions (A4 Landscape: 842.4 × 597.6 pt) ──────────────────────────────
const PAGE_W = 842.4;
const PAGE_H = 597.6;

function getOrdinalDay(day: number): string {
  if (day > 3 && day < 21) return day + 'th';
  switch (day % 10) {
    case 1:  return day + 'st';
    case 2:  return day + 'nd';
    case 3:  return day + 'rd';
    default: return day + 'th';
  }
}

function formatCeremonyDate(isoDateStr: string): string {
  try {
    const d = new Date(isoDateStr || Date.now());
    const day = getOrdinalDay(d.getDate());
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `Given this ${day} day of ${month} ${year} at University of Rizal System Cainta, Rizal.`;
  } catch {
    return 'Given this day at University of Rizal System Cainta, Rizal.';
  }
}

interface TextToken {
  text: string;
  bold: boolean;
}

/**
 * Parses markdown-style **bold** markers into tokens with bold flags.
 */
function parseTokens(raw: string): TextToken[] {
  const tokens: TextToken[] = [];
  const parts = raw.split(/(\*\*.*?\*\*)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      tokens.push({ text: part.slice(2, -2), bold: true });
    } else {
      tokens.push({ text: part, bold: false });
    }
  }
  return tokens;
}

/**
 * Splits formatted tokens into lines that fit within maxWidth.
 */
function wrapFormattedTokens(
  tokens: TextToken[],
  fontReg: any,
  fontBold: any,
  fontSize: number,
  maxWidth: number
): TextToken[][] {
  const lines: TextToken[][] = [];
  let currentLine: TextToken[] = [];
  let currentLineWidth = 0;

  // Decompose tokens into word units so we can wrap cleanly
  const words: TextToken[] = [];
  for (const token of tokens) {
    const subWords = token.text.split(/(?<=\s)|(?=\s)/);
    for (const sw of subWords) {
      if (sw) {
        words.push({ text: sw, bold: token.bold });
      }
    }
  }

  for (const w of words) {
    const font = w.bold ? fontBold : fontReg;
    const wWidth = font.widthOfTextAtSize(w.text, fontSize);

    if (currentLineWidth + wWidth <= maxWidth || currentLine.length === 0) {
      currentLine.push(w);
      currentLineWidth += wWidth;
    } else {
      lines.push(currentLine);
      currentLine = [w];
      currentLineWidth = wWidth;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Trim leading/trailing whitespace tokens from each line
  return lines.map((line) => {
    let start = 0;
    while (start < line.length && line[start].text.trim() === '') start++;
    let end = line.length - 1;
    while (end >= start && line[end].text.trim() === '') end--;
    return line.slice(start, end + 1);
  });
}

/**
 * Generates an official, tamper-proof URS Cainta certificate PDF.
 * Uses exact Canva/PPTX typography and layout:
 * - Anastasia Script (67.9 pt) for Title
 * - Quincy Bold (37.7 pt, all caps) for Recipient Name
 * - Helveticish (17.0 pt & 14.4 pt) for Body & Subheads
 * - Arimo Regular (16.3 pt & 17.0 pt) for Header & Date Line
 * - Arapey Bold & Italic (18.5 pt) for Signatory
 * - Official high-resolution CERT BG background & dynamic QR code
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  // ── 1. Embed Background ───────────────────────────────────────────────────
  let bgLoaded = false;
  try {
    const bgPath = path.join(process.cwd(), 'public', 'templates', 'cert_bg.png');
    if (fs.existsSync(bgPath)) {
      const bgBytes = fs.readFileSync(bgPath);
      const bgImage = await pdfDoc.embedPng(bgBytes);
      page.drawImage(bgImage, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
      bgLoaded = true;
    }
  } catch (err) {
    console.warn('[pdfGenerator] Failed to embed cert_bg.png, using fallback border:', err);
  }

  if (!bgLoaded) {
    // Fallback decorative border
    page.drawRectangle({
      x: 18, y: 18,
      width: PAGE_W - 36, height: PAGE_H - 36,
      borderWidth: 3,
      borderColor: rgb(12 / 255, 31 / 255, 116 / 255),
      color: rgb(1, 1, 1),
    });
  }

  // ── 2. Load and Embed Fonts ───────────────────────────────────────────────
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  const fontAnastasia = await pdfDoc.embedFont(
    fs.readFileSync(path.join(fontsDir, 'AnastasiaScript.otf'))
  );
  const fontQuincy = await pdfDoc.embedFont(
    fs.readFileSync(path.join(fontsDir, 'Quincy-Bold.otf'))
  );
  const fontHelv = await pdfDoc.embedFont(
    fs.readFileSync(path.join(fontsDir, 'Helveticish.ttf'))
  );
  const fontHelvBold = await pdfDoc.embedFont(
    fs.readFileSync(path.join(fontsDir, 'Helveticish-Bold.ttf'))
  );
  const fontArimo = await pdfDoc.embedFont(
    fs.readFileSync(path.join(fontsDir, 'Arimo-Regular.ttf'))
  );
  const fontArapeyBold = await pdfDoc.embedFont(
    fs.readFileSync(path.join(fontsDir, 'Arapey-Bold.ttf'))
  );
  const fontArapeyItalic = await pdfDoc.embedFont(
    fs.readFileSync(path.join(fontsDir, 'Arapey-Italic.ttf'))
  );

  const drawCenteredText = (text: string, font: any, size: number, pdfY: number, color = rgb(0, 0, 0)) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (PAGE_W - w) / 2,
      y: pdfY,
      size,
      font,
      color,
    });
  };

  // ── 3. Top Header (Arimo 16.3 pt, black) ──────────────────────────────────
  const headerSize = 16.3;
  drawCenteredText('Republic of the Philippines', fontArimo, headerSize, 548.5);
  drawCenteredText('UNIVERSITY OF RIZAL SYSTEM', fontArimo, headerSize, 530.0);
  drawCenteredText('Province of Rizal', fontArimo, headerSize, 511.5);

  // ── 4. Intro Subhead & Title Definition ───────────────────────────────────
  const isRecognition = data.certificateType === 'RECOGNITION' || data.certificateType === 'WINNER';
  const isAppreciation = data.certificateType === 'APPRECIATION';

  let introSubhead = 'award this';
  let titleText = 'Certificate of Recognition';

  if (isRecognition) {
    introSubhead = 'award this';
    titleText = 'Certificate of Recognition';
  } else if (isAppreciation) {
    introSubhead = 'presents this';
    titleText = 'Certificate of Appreciation';
  } else {
    // Participation / Attendance
    introSubhead = 'presents this';
    titleText = 'Certificate of Participation';
  }

  // Draw Intro Subhead (Helveticish 14.4 pt)
  drawCenteredText(introSubhead, fontHelv, 14.4, 473.0);

  // ── 5. Certificate Title (Anastasia Script 67.9 pt, Royal Navy #0C1F74) ────
  const titleColor = rgb(12 / 255, 31 / 255, 116 / 255);
  drawCenteredText(titleText, fontAnastasia, 67.9, 400.0, titleColor);

  // ── 6. Preposition "to" (Helveticish 14.4 pt) ─────────────────────────────
  drawCenteredText('to', fontHelv, 14.4, 360.0);

  // ── 7. Recipient Name (Quincy Bold 37.7 pt, All Caps) ─────────────────────
  const rawName = (data.recipientName || data.studentName || 'Recipient').trim();
  const recipientUpper = rawName.toUpperCase();

  let nameSize = 37.7;
  let nameWidth = fontQuincy.widthOfTextAtSize(recipientUpper, nameSize);
  const maxNameWidth = 680;
  if (nameWidth > maxNameWidth) {
    nameSize = (maxNameWidth / nameWidth) * nameSize;
  }
  drawCenteredText(recipientUpper, fontQuincy, nameSize, 316.0);

  // ── 8. Horizontal Divider Line ────────────────────────────────────────────
  page.drawLine({
    start: { x: 81.36, y: 295.0 },
    end: { x: 761.05, y: 295.0 },
    thickness: 1.5,
    color: rgb(3 / 255, 10 / 255, 39 / 255),
  });

  // ── 9. Body Citation Paragraph (Helveticish 16.5 pt with Bold Highlights) ─
  let rawBodyCitation = '';

  if (data.eventDescription && data.eventDescription.trim().length > 10) {
    rawBodyCitation = data.eventDescription.trim();
  } else if (isRecognition) {
    const award = data.awardTitle || 'MVP';
    const comp = data.competitionTitle || data.eventTitle || 'Campus Competition';
    rawBodyCitation = `for being the **${award}** in the **${comp}** held at **University of Rizal System Cainta Campus**.`;
  } else if (isAppreciation) {
    const role = data.awardTitle || 'Distinguished Resource Speaker';
    rawBodyCitation = `in grateful recognition and sincere appreciation of their invaluable service and dedication as **${role}** during the **${data.eventTitle}** at **University of Rizal System Cainta Campus**.`;
  } else {
    // Participation
    rawBodyCitation = `for active participation and valuable engagement in the **${data.eventTitle}** at **University of Rizal System Cainta Campus**.`;
  }

  const tokens = parseTokens(rawBodyCitation);
  const bodyFontSize = 16.0;
  const wrappedLines = wrapFormattedTokens(tokens, fontHelv, fontHelvBold, bodyFontSize, 660);

  let currentBodyY = 265.0;
  const bodyLineHeight = 22.0;

  for (const lineTokens of wrappedLines) {
    // Measure total width of line
    let lineWidth = 0;
    for (const t of lineTokens) {
      const f = t.bold ? fontHelvBold : fontHelv;
      lineWidth += f.widthOfTextAtSize(t.text, bodyFontSize);
    }

    let startX = (PAGE_W - lineWidth) / 2;
    for (const t of lineTokens) {
      const f = t.bold ? fontHelvBold : fontHelv;
      page.drawText(t.text, {
        x: startX,
        y: currentBodyY,
        size: bodyFontSize,
        font: f,
        color: rgb(0, 0, 0),
      });
      startX += f.widthOfTextAtSize(t.text, bodyFontSize);
    }
    currentBodyY -= bodyLineHeight;
  }

  // ── 10. Date Line (Arimo Regular 16.5 pt) ─────────────────────────────────
  const dateText = formatCeremonyDate(data.issuedAt);
  drawCenteredText(dateText, fontArimo, 16.5, 150.0);

  // ── 11. Signatory Block (Arapey Bold & Arapey Italic 18.5 pt) ─────────────
  const signatoryName = (data.signatoryName || 'MARJORIE DF. SAN JUAN, PhD').trim();
  const signatoryPosition = (data.signatoryPosition || 'Student Development Services Coordinator').trim();

  drawCenteredText(signatoryName, fontArapeyBold, 18.5, 78.0);
  drawCenteredText(signatoryPosition, fontArapeyItalic, 17.5, 54.0);

  // ── 12. Verification QR Code (Positioned at 705.34, 22.27, size 111.32) ───
  try {
    const verifyUrl = getCertificateVerifyUrl(data.verificationCode);
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 260,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const qrX = 705.34;
    const qrY = 22.27;
    const qrSize = 111.32;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });
  } catch (qrErr) {
    console.error('[pdfGenerator] QR generation error:', qrErr);
  }

  return await pdfDoc.save();
}
