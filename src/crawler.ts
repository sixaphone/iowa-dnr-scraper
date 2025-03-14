import type { Page } from 'playwright';
import { EnforcementOrder } from './database/enforcement_order.entity';
import { Logger } from './logger';

export class IowaDnrCrawler {
  private readonly _url = 'https://programs.iowadnr.gov/documentsearch/Home/NextPage';
  private _pageNum = 1;

  private readonly CELL_MAP = {
    DEFENDANT: 5,
    DATE: 2,
  } as const;

  constructor(
    private readonly page: Page,
    private readonly logger: Logger,
  ) {}

  public async setup() {
    this.logger.info('Setting up Iowa DNR crawler');
    await this.page.goto(`${this._url}?page=${this._pageNum}`);
    await this.page.selectOption('select[name="programfilter"]', 'DNR - Administrative Orders');
    await this.page.selectOption('select[name="limitFilter"]', '100');
    await this.page.click('input[id="searchSubmit"]');
    this.logger.info('Crawler setup complete');
  }

  public async scrapePage() {
    this.logger.info(`Fetching page:[%d] orders from Iowa DNR`, this._pageNum);

    const rows = await this.page.$$('table#ResultsTable tbody tr');
    let pageOrders: EnforcementOrder[] = [];
    for (const row of rows) {
      const cells = await row.$$('td');

      if (cells.length === 0) {
        continue;
      }

      pageOrders.push({
        defendant: await cells[this.CELL_MAP.DEFENDANT].innerText(),
        dataSourceLink: this.page.url(),
        year: new Date(await cells[this.CELL_MAP.DATE].innerText()).getFullYear(),
        settlement: '0',
        plaintiff: 'Iowa DoNR',
        violationType: 'Environmental',
      } satisfies EnforcementOrder);
    }
    this.logger.info(`Completed fetching page:[%d] orders from Iowa DNR. Found [%d] orders.`, this._pageNum, pageOrders.length);

    return pageOrders;
  }

  public async hasMorePages() {
    return await this.page.locator('tfoot a:has-text("Next")').isVisible();
  }

  public async goToNextPage() {
    this._pageNum++;
    await this.page.goto(`${this._url}?page=${this._pageNum}`);
    this.logger.info(`Navigated to page:${this._pageNum}`);
  }
}
