import { auth } from "./auth.js";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { spreadSheetId, trackingCellRange } from "./constants.js";

const loadCellRange = async (y1, z1) => {
  const serviceAccountAuth = auth();

  const doc = new GoogleSpreadsheet(spreadSheetId, serviceAccountAuth);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  await sheet.loadCells(`${y1}:${z1}`);
  const yTrackingCell = sheet.getCellByA1(y1);
  const zTrackingCell = sheet.getCellByA1(z1);

  trackingCellRange.Y1 = yTrackingCell.value;
  trackingCellRange.Z1 = zTrackingCell.value;

  return doc;
};

export { loadCellRange };
