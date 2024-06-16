const checkForDeliveredStatus = async (sheet, currentColumnStr) => {
  const rowStr = currentColumnStr.match(/\d+/g);
  const bStatusCell = sheet.getCellByA1(`B${rowStr}`);

  if (bStatusCell.value === "Delivered") {
    console.log(`Delivered status at: B${rowStr}`);
    return "Exists";
  }
  return "Fetching Data... ";
};

export { checkForDeliveredStatus };
