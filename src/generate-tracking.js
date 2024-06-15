import { auth } from "./auth.js";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { data, rowNumber, spreadSheetId, trackingCell } from "./constants.js";

const getWayBillNoFromSheet = async () => {
  try {
    const serviceAccountAuth = auth();

    const doc = new GoogleSpreadsheet(spreadSheetId, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    await sheet.loadCells(`A${rowNumber}:Z${rowNumber}`);
    const eTrackingCell = sheet.getCellByA1(trackingCell);

    const regex = /JTE\d\d\d\d\d\d\d\d\d\d\d\d/;
    const match = eTrackingCell.hyperlink.match(regex);

    data["Track#"] = match[0];
    return [match[0], sheet];
  } catch (err) {
    console.log(err);
    console.log("Unable to get tracking number from Google Sheet");
    process.exit();
  }
};

export { getWayBillNoFromSheet };
