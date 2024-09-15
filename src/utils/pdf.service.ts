import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Account } from 'src/modules/accounts/account.entity';
import { Transaction } from 'src/modules/transactions/transaction.entity';

@Injectable()
export class PdfService {
  async generateAccountStatement(
    account: Account,
    transactions: Transaction[],
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();

    let page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSizeTitle = 20;
    const fontSizeBody = 12;
    const fontSizeHeader = 16;
    const margin = 50;

    let currentY = height - margin;

    page.drawText('Account Statement', {
      x: margin,
      y: currentY,
      size: fontSizeTitle,
      font: titleFont,
      color: rgb(0, 0, 0),
    });

    currentY -= fontSizeTitle + 20;
    page.drawText(`Account Holder: ${account.user.username}`, {
      x: margin,
      y: currentY,
      size: fontSizeHeader,
      font: bodyFont,
    });

    currentY -= fontSizeHeader + 10;
    page.drawText(`Account Number: ${account.id}`, {
      x: margin,
      y: currentY,
      size: fontSizeBody,
      font: bodyFont,
    });

    currentY -= fontSizeBody + 10;
    page.drawText(`Account Type: ${account.accountType}`, {
      x: margin,
      y: currentY,
      size: fontSizeBody,
      font: bodyFont,
    });

    currentY -= fontSizeBody + 10;
    page.drawText(`Balance: ${account.balance}`, {
      x: margin,
      y: currentY,
      size: fontSizeBody,
      font: bodyFont,
    });

    currentY -= fontSizeBody + 20;
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: width - margin, y: currentY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    currentY -= 20;

    page.drawText('Transactions:', {
      x: margin,
      y: currentY,
      size: fontSizeHeader,
      font: bodyFont,
    });

    currentY -= fontSizeHeader + 10;

    for (const transaction of transactions) {
      const transactionCreatedAt = transaction.createdAt
        .toISOString()
        .split('T');
      const transactionDate = transactionCreatedAt[0];
      const transactionTime = transactionCreatedAt[1].split('.')[0];
      page.drawText(
        `${transactionDate} ${transactionTime} - ${transaction.transactionType}: ${transaction.amount} (Ref: ${transaction.reference})`,
        {
          x: margin,
          y: currentY,
          size: fontSizeBody,
          font: bodyFont,
        },
      );

      currentY -= fontSizeBody + 5;

      if (currentY < margin) {
        page = pdfDoc.addPage([600, 800]);
        currentY = height - margin;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
