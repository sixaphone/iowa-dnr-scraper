import playwright from 'playwright';
import { Record } from './record';
import { CELL_MAP } from './constants';

async function main() {
  const browser = await playwright.chromium.launch({
    headless: false, // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  let pageNum = 1;
  await page.goto(`https://programs.iowadnr.gov/documentsearch/Home/NextPage?page=${pageNum}`);
  await page.selectOption('select[name="programfilter"]', 'DNR - Administrative Orders');
  await page.click('input[id="searchSubmit"]');
  // await page.waitForLoadState('domcontentloaded');

  while (await page.locator('tfoot a:has-text("Next")').isVisible()) {
    await page.goto(`https://programs.iowadnr.gov/documentsearch/Home/NextPage?page=${pageNum}`);
    pageNum++;
  }



  // await page.waitForLoadState('domcontentloaded');

  // const rows = await page.$$('table#ResultsTable tbody tr');
  //
  // for (const row of rows) {
  //   const cells = await row.$$('td');
  //
  //   if (cells.length === 0) {
  //     continue;
  //   }
  //
  //   const record = new Record({
  //     defendant: await cells[CELL_MAP.DEFENDANT].innerText(),
  //     dataSourceLink: page.url(),
  //     year: new Date(await cells[CELL_MAP.DATE].innerText()).getFullYear(),
  //     settlement: '0',
  //     plaintiff: 'Iowa DoNR',
  //     violationType: 'Environmental',
  //   });
  //   console.log({ record });
  // }

  await page.waitForTimeout(3000);
  await browser.close();
}

main()
  .then(() => console.log('Done'))
  .catch(console.error);
