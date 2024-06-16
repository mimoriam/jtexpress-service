import { getWayBillNoFromSheet } from "./generate-tracking.js";
import { browser, extractDataFromBrowser } from "./scrape-data.js";
import { writeBackToGoogleSheet } from "./google-export.js";
import { checkForDeliveredStatus } from "./check-delivered.js";
import { endColumn, startColumn, startLetter } from "./constants.js";

const main = async () => {
  let currentColumn = startColumn;

  while (currentColumn <= endColumn) {
    const currentColumnStr = `${startLetter}${currentColumn}`;

    let [wayBillNo, sheet] = await getWayBillNoFromSheet(currentColumnStr);

    let fetching = await checkForDeliveredStatus(sheet, currentColumnStr);

    if (fetching === "Exists") {
      currentColumn++;
      if (currentColumn > endColumn) {
        await browser.close();
        break;
      }
      continue;
    }

    let { data } = await extractDataFromBrowser(wayBillNo);

    await writeBackToGoogleSheet(sheet, currentColumnStr);
    console.log(data);

    if (wayBillNo && sheet && fetching && data) {
      currentColumn++;
      if (currentColumn > endColumn) {
        await browser.close();
        break;
      }
    } else {
      await browser.close();
      break;
    }
  }
};

await main();
