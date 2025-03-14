import { promises as fs } from 'fs';
import * as path from 'path';
import { createWorker } from 'tesseract.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Logger } from './logger';
import { ElementHandle, Page } from 'playwright';

const execPromise = promisify(exec);

export class PdfExtractor {
  private readonly pdfDir: string;
  private readonly imageDir: string;

  constructor(private readonly logger: Logger) {
    this.pdfDir = path.join(process.cwd(), 'pdfs');
    this.imageDir = path.join(process.cwd(), 'pdfs', 'images');
  }

  async init(): Promise<void> {
    await fs.mkdir(this.pdfDir, { recursive: true });
    await fs.mkdir(this.imageDir, { recursive: true });
  }

  async downloadPdf(page: Page, pdfTag: ElementHandle): Promise<string> {
    const downloadPromise = page.waitForEvent('download');
    await pdfTag!.click();
    const download = await downloadPromise;
    const filePath = path.join(this.pdfDir, download.suggestedFilename());
    await download.saveAs(filePath);
    this.logger.info(`PDF downloaded to ${filePath}`);

    return filePath;
  }

  async extractPenaltyFromPdf(pdfPath: string): Promise<string> {
    this.logger.info(`Extracting penalty information from ${pdfPath}`);

    try {
      const baseName = path.basename(pdfPath, '.pdf');
      const outputPattern = path.join(this.imageDir, `${baseName}-%d.png`);

      await execPromise(`magick convert -density 300 "${pdfPath}" "${outputPattern}"`);
      this.logger.info(`Converted ${pdfPath} to images`);

      const files = await fs.readdir(this.imageDir);
      const imageFiles = files.filter(file => file.startsWith(baseName) && file.endsWith('.png'));

      if (imageFiles.length === 0) {
        throw new Error(`No images were generated from the PDF ${pdfPath}`);
      }

      const worker = await createWorker('eng');

      let penaltyAmount: string | null = null;

      for (const imageFile of imageFiles) {
        const imagePath = path.join(this.imageDir, imageFile);
        const {
          data: { text },
        } = await worker.recognize(imagePath);

        const penaltyPatterns = [/penalty of \$([0-9,.]+)/i, /penalty\s+\$([0-9,.]+)/i, /fine of \$([0-9,.]+)/i, /administrative penalty of \$([0-9,.]+)/i];

        for (const pattern of penaltyPatterns) {
          const match = text.match(pattern);
          if (match) {
            penaltyAmount = match[1];
            this.logger.info(`Found penalty amount: $${penaltyAmount} in pdf ${pdfPath}`);
            break;
          }
        }

        if (penaltyAmount) break;
      }

      await worker.terminate();

      for (const imageFile of imageFiles) {
        await fs.unlink(path.join(this.imageDir, imageFile));
      }

      return penaltyAmount ? `${penaltyAmount}` : '0';
    } catch (error) {
      this.logger.info(`Error extracting penalty from ${pdfPath}: ${error}`);
      return '0';
    }
  }

  public async removePdf(pdfPath: string) {
    await fs.unlink(pdfPath);
  }
}
