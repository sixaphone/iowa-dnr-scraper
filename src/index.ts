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

    const context = await browser.newContext();
    const crawler = new IowaDnrCrawler(context, new Logger(console));
    await crawler.setup();

    const spawns = [];

    const MAX_SPAWN_CHUNK_SIZE = process.env.MAX_SPAWN_CHUNK_SIZE ? +process.env.MAX_SPAWN_CHUNK_SIZE : 5;
    const MAX_PAGE_LOOKUP = process.env.MAX_PAGE_LOOKUP ? +process.env.MAX_PAGE_LOOKUP : 66;

    while (crawler.pageNum <= MAX_PAGE_LOOKUP) {
      const pageNum = crawler.pageNum;
      spawns.push(crawler.spawn(pageNum));

      if (spawns.length === MAX_SPAWN_CHUNK_SIZE) {
        const entities = await Promise.all(spawns);
        await database.insert(EnforcementOrderEntity).values(entities.flat());
        spawns.length = 0;
      }

      crawler.goToNextPage();
    }

    if (spawns.length > 0) {
      const entities = await Promise.all(spawns);
      await database.insert(EnforcementOrderEntity).values(entities.flat());
    }

    await crawler.wait(5000);
    await crawler.teardown();
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
