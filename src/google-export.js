import { data } from "./constants.js";

const writeBackToGoogleSheet = async (sheet, currentColumnStr) => {
  const rowStr = currentColumnStr.match(/\d+/g);
  try {
    const statusCell = sheet.getCellByA1(`B${rowStr}`);
    const dispatchDateCell = sheet.getCellByA1(`C${rowStr}`);
    const signedDateCell = sheet.getCellByA1(`G${rowStr}`);
    const riderNumberCell = sheet.getCellByA1(`U${rowStr}`);
    const attemptsCell = sheet.getCellByA1(`T${rowStr}`);
    const abnormalReasonCell = sheet.getCellByA1(`V${rowStr}`);
    const lastUpdatedCell = sheet.getCellByA1(`W${rowStr}`);
    const successCell = sheet.getCellByA1(`X${rowStr}`);

    statusCell.value = data["Status of"];
    dispatchDateCell.value = data["Dispatch Date"];
    dispatchDateCell.textDirection = "RIGHT_TO_LEFT";
    signedDateCell.value = data["Signed Date"];
    signedDateCell.textDirection = "LEFT_TO_RIGHT";
    riderNumberCell.value = data["Rider Number"];
    attemptsCell.value = data["Attempts Made"];
    abnormalReasonCell.value = data["Abnormal Reason"];
    lastUpdatedCell.value = data["Last Updated"];
    successCell.value = data.Success;

    await sheet.saveUpdatedCells();
  } catch (err) {
    console.log("Unable to write data back to Google Sheets");
  }
};

export { writeBackToGoogleSheet };
