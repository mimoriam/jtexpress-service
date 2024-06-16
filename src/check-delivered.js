import { rowNumber } from "./constants.js";

const checkForDeliveredStatus = async (sheet) => {
  const bStatusCell = sheet.getCellByA1(`B${rowNumber}`);

  if (bStatusCell.value === "Delivered") {
    console.log(`Delivered status at: B${rowNumber}`);
    process.exit();
  }
  return "Fetching Data... ";
};

export { checkForDeliveredStatus };
