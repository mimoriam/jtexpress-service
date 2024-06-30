import { loadCellRange } from "./load-range.js";
import { getWayBillNoFromSheet } from "./generate-tracking.js";
import { browser, extractDataFromBrowser } from "./scrape-data.js";
import { writeBackToGoogleSheet } from "./google-export.js";
import { checkForDeliveredStatus } from "./check-delivered.js";
import { trackingCellRange } from "./constants.js";
import { backOff } from "exponential-backoff";
import { AxiosError } from "axios";

const main = async () => {
  try {
    const doc = await loadCellRange("Y1", "Z1");
    console.log(trackingCellRange);

    if (doc) {
      var startColumn = trackingCellRange.Y1;
      var endColumn = trackingCellRange.Z1;

      var startLetter = "E";

      var currentColumn = startColumn;
    } else {
      console.log("Enter row/column values at Y1 & Z1");
      process.exit();
    }

    while (Number(currentColumn) <= Number(endColumn)) {
      const currentColumnStr = `${startLetter}${currentColumn}`;

      // let [wayBillNo, sheet] = await getWayBillNoFromSheet(currentColumnStr);
      let [wayBillNo, sheet] = await backOff(
        () => getWayBillNoFromSheet(currentColumnStr, doc),
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
