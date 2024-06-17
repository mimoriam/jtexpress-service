// Change these constants:
export const spreadSheetId = "1f6uxhLIE7XCtXkVlI9mVAlyEd-PTKSUDslAv2PSUFkk/";
export const trackingCellRange = "E9-E10";
export const timeOutInSeconds = 2000;

// * Do not touch:
// Returns [2, 3] for "E2-E3":
export const [startColumn, endColumn] = trackingCellRange
  .split("-")
  .map((col) => col.replace(/[A-Z]/, ""));

export const startLetter = trackingCellRange[0];

export const data = {
  "Status of": "",
  "Dispatch Date": "",
  "Track#": "",
  "Signed Date": "",
  "Package Result": "",
  "Rider Name": "",
  "Rider Number": "",
  "Abnormal Reason": "",
  "Attempts Made": "",
  "Time in transit": "",
  "Last Updated": "",
  Success: "",
};
