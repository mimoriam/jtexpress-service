import { getWayBillNoFromSheet } from "./generate-tracking.js";
import { extractDataFromBrowser } from "./scrape-data.js";
import { writeBackToGoogleSheet } from "./google-export.js";

const main = async () => {
  const [wayBillNo, sheet] = await getWayBillNoFromSheet();

  const data = await extractDataFromBrowser(wayBillNo);

  await writeBackToGoogleSheet(sheet);
  console.log(data);
};

await main();
