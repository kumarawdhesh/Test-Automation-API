// utility.js

import { showSnackbar } from "../store/appSlice";
import { DEMO_MODE } from "../../environment";

export function isUserAuthenticated() {
  if (DEMO_MODE) {
    return true;
  }

  try {
    // Check if sessionStorage is available and not null
    if (typeof sessionStorage !== "undefined" && sessionStorage !== null) {
      // Check if the token exists in sessionStorage
      const token = sessionStorage.getItem("token");
      const username = sessionStorage.getItem("username");
      if (token !== null && token !== undefined && token !== "" && username !== null && username !== undefined && username !== "") {
        return true; // Token is available
      }
    }
  } catch (error) {
    // Handle any errors that might occur when accessing sessionStorage
    console.error("Error accessing sessionStorage:", error);
  }

  return false; // Token is not available or an error occurred
}

export function getDataFromStorage(key) {
  try {
    const data = sessionStorage.getItem(key);
    if (data != null) {
      return data;
    } else {
      return "";
    }
    // Return the string data as is
  } catch (error) {
    // Handle any errors that occur during retrieval
    console.error(
      `Error retrieving data from session storage for key '${key}': ${error.message}`
    );
    return ""; // You can return a default value or null in case of an error
  }
}

// export function checkUserAccess() {
//   const access = sessionStorage.getItem("access");
//   const accessBool = access !== null ? (access.trim() === "false" ? false : Boolean(access)) : false;
//   return accessBool
// }

export function getUserFromStorage() {
  // Retrieve data from session storage
  const email = sessionStorage.getItem("username") || ""; // Set to empty string if null
  const first_name = sessionStorage.getItem("first_name") || ""; // Set to empty string if null
  const last_name = sessionStorage.getItem("last_name") || ""; // Set to empty string if null
  const token = sessionStorage.getItem("token") || ""; // Set to empty string if null
  const access = sessionStorage.getItem("access");
  const accessBool = access !== null ? (access.trim() === "false" ? false : Boolean(access)) : false;

  // Create the user object
  const user = {
    username: email,
    first_name: first_name,
    last_name: last_name,
    full_name: first_name + " " + last_name,
    token: token,
    access:accessBool
  };

  return user;
}

export function storeDataInStorage(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.error('Error storing data in session storage:', error);
  }
}

export function clearAllDataFromStorage() {
  try {
    // Clear all data from session storage
    sessionStorage.clear();
    // Commenting out the below line as we don't want to clear the domain and sub domain selection across login sessions
    // localStorage.clear();
    
  } catch (error) {
    console.error('Error clearing all data from session storage:', error);
  }
}

export function clearDataFromStorage(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing data from session storage:', error);
  }
}

// Function to smoothly scroll to the bottom of the container
export function scrollToBottom(id) {
  const container = document.getElementById(id);
  if (container) {
    const scrollToOptions = {
      top: container.scrollHeight,
      behavior: 'smooth',
    };
    container.scrollTo(scrollToOptions);
  }
}

export function toCamelCase(inputString = "") {
  const inputStringOpt = inputString.trim();
  // Split the input string by underscores or white spaces
  const words = inputStringOpt.split(/[_\s]+/);
  let finalStringArray = [];
  // Capitalize the first letter of each word
  for (let i = 0; i < words.length; i++) {
    if (words[i] != null && words[i] != "") {
      let val = words[i][0].toUpperCase() + words[i].slice(1).toLowerCase();
      finalStringArray.push(val);
    }
  }
  // Join the words back together with spaces
  const camelCaseString = finalStringArray.join(" ");

  return camelCaseString;
}

export function convertArrayToLowerCase(inputArray=[]) {
  const resultArray = [];
  for (let i = 0; i < inputArray.length; i++) {
    let lowercaseValue =inputArray[i]
    if (lowercaseValue !== "") {
      const opt = lowercaseValue.toLowerCase();
      resultArray.push(opt);
    } else {
      resultArray.push(lowercaseValue);
    }
  }
  return resultArray;
}

export function convertStringToLowerCase(inputString = "") {
    if (inputString !== "") {
      return inputString.toLowerCase();
    }
  return inputString;
}

export function convertStringToUpperCase(inputString = "") {
  if (inputString !== "") {
    return inputString.toUpperCase();
  }
return inputString;
}

/**
 * @description formatted date in (July 12th at 8:24 PM) format
 * @param {String} inputDate 
 * @returns 
 */
export const getFormattedTime = (inputDate)=> {
  const unixTimestamp = new Date(inputDate).getTime() / 1000;

  // Create a new Date object from the Unix timestamp
  const date = new Date(unixTimestamp * 1000);

  // Define month names for formatting
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get the month, day, hour, and minute components
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  // Determine whether it's AM or PM
  const amPm = hour >= 12 ? "PM" : "AM";

  // Convert hour to 12-hour format
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  // Format the date
  const formattedDate = `${month} ${day}th at ${hour12}:${minute.toString().padStart(2, '0')} ${amPm}`;
  /* "July 12th at 8:24 PM" */

  return formattedDate
}

/**
 * @description Formatting date to Today, Yesterday, 
 * @param {String} dateInput 
 * @returns 
 */
export const getTimeAgoString = (dateInput) => {
  const date = new Date(dateInput);
  const currDate = new Date();

  const getDateString = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  const seconds = Math.floor((currDate - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + ' years ago';
  }

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + ' months ago';
  }

  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + ' days ago';
  }

  if (getDateString(date) === getDateString(currDate)) return 'Today';
  if (
    getDateString(date) ===
    getDateString(new Date(currDate.getTime() - 86400000))
  )
    return 'Yesterday';

  // return Math.floor(seconds) + ' seconds ago';
};



/**
 * @description Formatting data to numeric array to display in chart
 * @param {String} data 
 * @returns numeric array
 */
export const parseNumericData = (data) => {
  const numericData = data
    .map((value) => {
      // Remove dollar signs and commas
      if (typeof value === "string") {
        value = value?.trim();
        const cleanedValue = value.replace(/[$,]/g, "");
        // Check if the cleaned value is numeric or starts with a dollar sign
        if (/^\d+(\.\d+)?$/.test(cleanedValue) || /^\$$/.test(value)) {
          return parseFloat(cleanedValue);
        } else {
          return 0;
        }
      } else {
        return value;
      }
    })
    // .filter((value) => value > 0); // Filter out values that are not greater than 0

  return numericData;
}

/**
 * @description Cleanup string & remove in between multiple white space
 * @param {String} inputString 
 * @returns object with clean string & word count
 */
export const processString = (inputString = "") => {
  // Remove white space from start and end
  const trimmedString = inputString.trim();

  // Convert multiple in-between spaces to a single space
  const condensedString = trimmedString.replace(/\s+/g, " ");

  // Split by space
  const wordsArray = condensedString.split(" ");

  // Calculate word count
  const wordCount = wordsArray.length;

  // Create an object with the final string and word count
  const result = {
    finalString: condensedString,
    wordCount: wordCount,
  };

  return result;
};

/**
 * @description Copy html textinput data to clipboard using id
 * @param {String} id 
 * @returns void
 */
export const copyToClipboardById = (id) => {

  const divContent = document.getElementById(id).innerHTML;
  const tempElement = document.createElement("div");
  tempElement.innerHTML = divContent;

  // Append the temporary element to the document (inside the body or another appropriate container)
  document.body.appendChild(tempElement);

  // Create a range and select the contents of the temporary element
  const range = document.createRange();
  range.selectNodeContents(tempElement);

  // Create a selection and add the range to it
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Copy the selected HTML content to the clipboard
  document.execCommand("copy");

  // Deselect the text
  selection.removeAllRanges();

  // Remove the temporary element from the document
  document.body.removeChild(tempElement);
};

export const checkOrganizationAndApplication = () =>{
    const org = getDataFromStorage('organization')
    const app = getDataFromStorage('application')

  return {org, app}
}

export const consoleLog = (LOG_LEVEL = 'info', ...data) => {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let current_time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  let timestamp = `${day}/${month}/${year} ${current_time}`;
  const value = localStorage.getItem("logger");
  if (value === 'true') {
    switch (LOG_LEVEL) {
      case "info":
        return console.info(...data, timestamp);
      case "warning":
        return console.warn(...data, timestamp);
      case "error":
        return console.error(...data, timestamp);
      case "table":
        return console.table(...data);
      default:
        return console.log(...data, timestamp);
    }
  }
}

//to sort data in dec order
export const sortDataInDecOrder = (data, key) => {
  return [...data].sort((a, b) => b[key] - a[key]) || [];
};

export function checkUserAccess() {
  if (DEMO_MODE) {
    return true;
  }

  const orgObj = JSON.parse(localStorage.getItem("organization"));
  const appObj = JSON.parse(localStorage.getItem("application"));

  const userAccessInfo = JSON.parse(getDataFromStorage("userAccessInfo"));

  const orgAccess = userAccessInfo?.organizations?.find(
    (org) => org.name === orgObj?.orgName
  );
  const appAccess = orgAccess?.applications?.find(
    (app) => app.name === appObj?.appName
  );
  
  if (["Write", "Execute", "Admin"].includes(appAccess?.privileges)) {
    return true;
  } else {
    return false;
  }
}

export function showReadOnlySnackbar(dispatch) {
  dispatch(
    showSnackbar({
      message: "You have read-only access, cannot perform this operation.",
      className: "color-error-background",
    })
  );
}

export const cleanString = (input) => {
  if (typeof input === 'string') {
      return input?.trim().replace(/\s+/g, ' ');
  }
  return input;
}