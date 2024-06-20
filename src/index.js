import { getWayBillNoFromSheet } from "./generate-tracking.js";
import { browser, extractDataFromBrowser } from "./scrape-data.js";
import { writeBackToGoogleSheet } from "./google-export.js";
import { checkForDeliveredStatus } from "./check-delivered.js";
import { endColumn, startColumn, startLetter } from "./constants.js";
import { backOff } from "exponential-backoff";
import { AxiosError } from "axios";

const main = async () => {
  try {
    // For E9-E10, JS considers "9" < "10" to be false
    // Dumb as fuck bug, I swear
    let currentColumn = startColumn;

    while (Number(currentColumn) <= Number(endColumn)) {
      const currentColumnStr = `${startLetter}${currentColumn}`;

      // let [wayBillNo, sheet] = await getWayBillNoFromSheet(currentColumnStr);
      let [wayBillNo, sheet] = await backOff(
        () => getWayBillNoFromSheet(currentColumnStr),
        {
          numOfAttempts: 11,
          retry: (e, attemptNumber) => {
            console.log(`Attempt ${attemptNumber} failed!`);
            return true;
          },
        },
      );

      if (wayBillNo === "error") {
        currentColumn++;
        if (currentColumn > endColumn) {
          if (browser) {
            await browser.close();
            break;
          }
        }
        continue;
      }

      let fetching = await checkForDeliveredStatus(sheet, currentColumnStr);

      if (fetching === "Exists") {
        currentColumn++;
        if (currentColumn > endColumn) {
          if (browser) {
            await browser.close();
            break;
          }
        }
        continue;
      }

      let [data, err] = await extractDataFromBrowser(
        wayBillNo,
        currentColumnStr,
      );

      if (err === "error") {
        currentColumn++;
        if (currentColumn > endColumn) {
          if (browser) {
            await browser.close();
            break;
          }
        }
        continue;
      }

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
  } catch (err) {
    if (err instanceof AxiosError) {
      process.exit();
    } else {
      console.log(err);
    }
  }
};

await main();
