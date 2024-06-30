import { data } from "./constants.js";
import { AxiosError } from "axios";

const getWayBillNoFromSheet = async (currentColumnStr, doc) => {
  try {
    const sheet = doc.sheetsByIndex[0];

    const rowStr = currentColumnStr.match(/\d+/g);
    await sheet.loadCells(`A${rowStr}:Z${rowStr}`);
    const eTrackingCell = sheet.getCellByA1(currentColumnStr);

    const regex = /JTE\d\d\d\d\d\d\d\d\d\d\d\d/;
    const match = eTrackingCell.hyperlink.match(regex);

    data["Track#"] = match[0];
    return [match[0], sheet];
  } catch (err) {
    if (err instanceof TypeError) {
      console.log(`No tracking number for row at: ${currentColumnStr}`);
      return ["error", null];
    } else if (err instanceof AxiosError) {
      console.log(`API Quota exceeded for ${currentColumnStr}!`);
      throw err;
    } else {
      console.log(err);
      return ["error", null];
    }
  }
};

export { getWayBillNoFromSheet };
