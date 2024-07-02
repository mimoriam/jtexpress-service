import puppeteer from "puppeteer-core";
import { getChromePath } from "browser-paths";
import { getUserAgent } from "universal-user-agent";
import { format } from "date-fns";
import { data, timeOutInSeconds } from "./constants.js";

export let browser;
let page;

const extractDataFromBrowser = async (wayBillNo, currentColumnStr) => {
  try {
    if (!browser) {
      browser = await puppeteer.launch({
        // Add this for Cron scheduling:
        env: {
          DISPLAY: ":10.0"
        },
        headless: false,
        executablePath: getChromePath(),
        args: [
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
        ],
      });

      // [page] = await browser.page();
      page = await browser.newPage();
    } else {
      page = await browser.newPage();
    }

    await page.setUserAgent(getUserAgent());
    await page.setViewport({ width: 1600, height: 900 });
    console.log(`Starting to scrape data for row: ${currentColumnStr}`);

    // Block images/videos/font from loading:
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.isInterceptResolutionHandled()) return;
      if (
        request.resourceType() === "image" ||
        request.resourceType() === "font"
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(
      `https://getcircuit.com/package-tracker/tracking?trackingCode=${wayBillNo}&carrierId=jtexpress-ae`,
      {
        // waitUntil: "networkidle2",
        waitUntil: "domcontentloaded",
      },
    );

    // * Selectors:
    const packageResultSelector = `span.animation-fade-in-1.text-subheading-website.flex.items-center`;
    const shippingDateSelector = `div > div > span.text-body-website.ml-4.text-gray-500`;
    const progressSelectorHead = `div.relative > ul > li > div.flex-1.py-3 > div.text-body-website`;
    const progressSelectorTail = `div.relative > ul > li > div.flex-1.py-3 > div.flex.flex-col.text-gray-400`;

    //! Scraping:
    const packageResultText = await page.waitForSelector(
      packageResultSelector,
      {
        timeout: timeOutInSeconds,
      },
    );

    const shippingDateText = await page.$$eval(shippingDateSelector, (el) =>
      el.map((e) => e.textContent),
    );

    const progressSelectorResultHead = await page.$$eval(
      progressSelectorHead,
      (el) => el.map((e) => e.textContent),
    );

    let status = progressSelectorResultHead[0];

    const onRoutePattern = new RegExp("\\b" + "was sent to" + "\\b", "gi");
    let m = status.match(onRoutePattern);

    if (m !== null) {
      if (m[0] === "was sent to") {
        status = "On Route";
      }
    }

    const returnedPattern = new RegExp(
      "\\b" + "returned to the sender" + "\\b",
      "gi",
    );
    let m2 = status.match(returnedPattern);

    if (m2 !== null) {
      if (m2[0] === "returned to the sender") {
        status = "Returned";
      }
    }

    const deliveredPattern = new RegExp(
      "\\b" + "Receiver signed" + "\\b",
      "gi",
    );
    let m3 = status.match(deliveredPattern);

    if (m3 !== null) {
      if (m3[0] === "Receiver signed") {
        status = "Delivered";
      }
    }

    const abnormalPattern = new RegExp("\\b" + "abnormal parcel" + "\\b", "gi");
    let m4 = status.match(abnormalPattern);

    if (m4 !== null) {
      if (m4[0] === "abnormal parcel") {
        status = "Abnormal";
      }
    }

    const isBeingReturnedPattern = new RegExp(
      "\\b" + "is being returned" + "\\b",
      "gi",
    );
    let m5 = status.match(isBeingReturnedPattern);

    if (m5 !== null) {
      if (m5[0] === "is being returned") {
        status = "Returning";
      }
    }

    const deliveringPattern = new RegExp(
      "\\b" + "out for delivery" + "\\b",
      "gi",
    );

    let m6 = status.match(deliveringPattern);

    if (m6 !== null) {
      if (m6[0] === "out for delivery") {
        status = "Delivering";
      }
    }

    const progressSelectorResultTail = await page.$$eval(
      progressSelectorTail,
      (el) => el.map((e) => e.textContent),
    );

    const riderInfo = progressSelectorResultHead
      .filter((str) => str.includes("courier"))
      .map((str) => {
        // const match = str.match(/courier\s*([\w\s]+)\s*\((\+?\d+-?\d+)\)/);
        const match = str.match(/courier ([A-Za-z- ]+)\((\+\d+-\d+)\)/);
        if (match) {
          return { name: match[1].trim(), phone: match[2] };
        } else {
          return "";
        }
      });

    const abnormalReason = progressSelectorResultHead
      .filter((str) => str.includes("abnormal"))
      .map((str) => {
        const match = str.match(/abnormal reason is (.*?)\./);
        if (match) {
          return match[1].trim();
        } else {
          return "";
        }
      });

    let abnormalAttempts = progressSelectorResultHead.filter((str) =>
      str.includes("abnormal"),
    ).length;

    if (abnormalAttempts === 0) {
      abnormalAttempts = 1;
    }

    //? Results in Text/Strings:
    data["Package Result"] = (
        await packageResultText.evaluate((el) => el.textContent)
    ).trim();

    if (data["Package Result"] === "In transit") {
      status = "On Route";
    } else if (data["Package Result"] === "Package delivered") {
      status = "Delivered";
    }

    data["Status of"] = status;

    if (data["Status of"].length > 24) {
      data["Status of"] = "ERROR";
    }

    data["Dispatch Date"] = format(
      new Date(
        progressSelectorResultTail[progressSelectorResultTail.length - 2]
          .split(",")[0]
          .replace(/\//g, "-"),
      ),
      "yyyy-MM-dd",
    );

    data["Signed Date"] = format(
      new Date(progressSelectorResultTail[0].split(",")[0].replace(/\//g, "-")),
      "yyyy-MM-dd",
    );

    data["Rider Name"] = riderInfo[0]?.name;
    data["Rider Number"] = riderInfo[0]?.phone;

    data["Abnormal Reason"] = abnormalReason[0];

    data["Attempts Made"] = abnormalAttempts;

    data["Time in transit"] = shippingDateText[3];

    data["Last Updated"] = format(new Date(), "yyyy-MM-dd h:mm a");

    if (data["Status of"] === "ERROR") {
      data.Success = "ERROR";
    } else {
      data.Success = "Success";
    }

    if (page !== (await browser.pages()[0])) {
      await page.close();
    }

    return [data];
  } catch (err) {
    console.log(err);
    console.log("Unable to scrape data from website");
    return [data, "error"];
  }
};

export { extractDataFromBrowser };
