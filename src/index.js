import { getWayBillNoFromSheet } from "./generate-tracking.js";
import { extractDataFromBrowser } from "./scrape-data.js";
import { writeBackToGoogleSheet } from "./google-export.js";
import { checkForDeliveredStatus } from "./check-delivered.js";

const main = async () => {
  const [wayBillNo, sheet] = await getWayBillNoFromSheet();

  const fetching = await checkForDeliveredStatus(sheet);
  console.log(fetching);

  const data = await extractDataFromBrowser(wayBillNo);

  await writeBackToGoogleSheet(sheet);
  console.log(data);
};

await main();
