import { data, rowNumber } from "./constants.js";

const writeBackToGoogleSheet = async (sheet) => {
  try {
    const statusCell = sheet.getCellByA1(`B${rowNumber}`);
    const dispatchDateCell = sheet.getCellByA1(`C${rowNumber}`);
    const signedDateCell = sheet.getCellByA1(`G${rowNumber}`);
    const riderNumberCell = sheet.getCellByA1(`U${rowNumber}`);
    const attemptsCell = sheet.getCellByA1(`T${rowNumber}`);
    const abnormalReasonCell = sheet.getCellByA1(`V${rowNumber}`);

    statusCell.value = data["Status of"];
    dispatchDateCell.value = data["Dispatch Date"];
    dispatchDateCell.textDirection = "RIGHT_TO_LEFT";
    signedDateCell.value = data["Signed Date"];
    signedDateCell.textDirection = "LEFT_TO_RIGHT";
    riderNumberCell.value = data["Rider Number"];
    attemptsCell.value = data["Attempts Made"];
    abnormalReasonCell.value = data["Abnormal Reason"];

    await sheet.saveUpdatedCells();
  } catch (err) {
    console.log(err);
    console.log("Unable to write data back to Google Sheets");
    process.exit();
  }
};

export { writeBackToGoogleSheet };
