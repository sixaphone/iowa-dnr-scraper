import type { Page, BrowserContext } from 'playwright';
import { CreateEnforcementOrder } from './database/enforcement_order.entity';
import { Logger } from './logger';
import { PdfExtractor } from './pdf_extractor';

export class IowaDnrCrawler {
  private readonly _url = 'https://programs.iowadnr.gov/documentsearch/Home/NextPage';
  private _pageNum = 1;
  private _rootPage: Page | null = null;
  private readonly pdfExtractor: PdfExtractor;

  get pageNum() {
    return this._pageNum;
  }

  private readonly CELL_MAP = {
    DEFENDANT: 5,
    DATE: 2,
    PDF_LINK: 0, // Assuming the PDF link is in the first column
  } as const;

  constructor(
    private readonly context: BrowserContext,
    private readonly logger: Logger,
  ) {
    this.pdfExtractor = new PdfExtractor(logger);
  }

  public async setup() {
    this.logger.info('Setting up Iowa DNR crawler');
    await this.pdfExtractor.init();
    this._rootPage = await this.context.newPage();
    await this._rootPage.goto(`${this._url}?page=${this._pageNum}`);
    await this._rootPage.selectOption('select[name="programfilter"]', 'DNR - Administrative Orders');
    await this._rootPage.selectOption('select[name="limitFilter"]', '100');
    await this._rootPage.click('input[id="searchSubmit"]');
    this.logger.info('Crawler setup complete');
  }

  public async teardown() {
    if (this._rootPage) {
      await this._rootPage.close();
    }
    await this.context.close();
  }

  public async wait(ms: number) {
    if (this._rootPage) {
      return this._rootPage!.waitForTimeout(ms);
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    return sleep(ms);
  }

  public async spawn(pageNum: number) {
    const page = await this.context.newPage();
    const entities = await this._scrape(page, pageNum);
    await page.close();

    return entities;
  }

  public goToNextPage() {
    this._pageNum++;
  }

  private async _scrape(page: Page, pageNum: number) {
    this.logger.info(`Fetching page:[%d] orders from Iowa DNR`, pageNum);
    await page.goto(`${this._url}?page=${pageNum}`, { timeout: 0 });
    const rows = await page.$$('table#ResultsTable tbody tr');
    let pageOrders: CreateEnforcementOrder[] = [];

    for (const row of rows) {
      const cells = await row.$$('td');

      if (cells.length === 0) {
        continue;
      }

      try {
        // Extract basic information from the table
        const [defendant, year] = await Promise.all([cells[this.CELL_MAP.DEFENDANT].innerText(), cells[this.CELL_MAP.DATE].innerText()]);

        // Extract PDF URL from the link in the first column
        const pdfLinkElement = await cells[this.CELL_MAP.PDF_LINK].$('a');
        let settlement = '0';

        if (pdfLinkElement) {
          const filename = await this.pdfExtractor.downloadPdf(page, pdfLinkElement);
          settlement = await this.pdfExtractor.extractPenaltyFromPdf(filename);
          await this.pdfExtractor.removePdf(filename);
        }

        pageOrders.push({
          defendant,
          year: new Date(year).getFullYear(),
          settlement,
          plaintiff: 'Iowa DoNR',
          violationType: 'Environmental',
          dataSourceLink: page.url(),
        } satisfies CreateEnforcementOrder);
      } catch (error) {
        this.logger.info(`Error processing row: ${error}`);
      }
    }
    this.logger.info(`Completed fetching page:[%d] orders from Iowa DNR. Found [%d] orders.`, pageNum, pageOrders.length);

    return pageOrders;
  }
}
