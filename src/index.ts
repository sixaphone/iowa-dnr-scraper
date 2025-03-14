import 'dotenv/config';
import playwright from 'playwright';
import { IowaDnrCrawler } from './crawler';
import { database } from './database';
import { EnforcementOrderEntity } from './database/enforcement_order.entity';
import { Logger } from './logger';

async function main() {
  try {
    const browser = await playwright.chromium.launch({
      headless: process.env.HEADLESS === 'true',
    });

    const page = await browser.newPage();
    const crawler = new IowaDnrCrawler(page, new Logger(console));
    await crawler.setup();

    while (await crawler.hasMorePages()) {
      const orders = await crawler.scrapePage();
      await crawler.goToNextPage();
      await database.insert(EnforcementOrderEntity).values(orders);
    }

    await browser.close();
    return 0;
  } catch (error) {
    console.error(error);
    return 1;
  }
}

main()
  .then(exitCode => {
    console.log('Done');
    process.exit(exitCode);
  })
  .catch(console.error);
