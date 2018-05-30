const platform = require('platform');

const messageTypes = {
  LOG: 'log',
  WARN: 'warn',
  ERROR: 'error'
};
const consoleMessages = [];
const uncaughtErrors = [];

function ConsoleMessage(type, messageArgs) {
  this.type = type;
  this.messageArgs = messageArgs;
  this.time = Date.now();
}

function getBrowserInfo() {
  return platform.description;
}

function getConsoleInfo() {
  return consoleMessages;
}

function getUncaughtErrorsInfo() {
  return uncaughtErrors;
}

// const oldWindowOnError = window.onerror;
//
// window.onerror = function (errorMsg, url, lineNumber, colNumber) {
//   uncaughtErrors.push({
//     message: errorMsg,
//     time: Date.now(),
//     url,
//     lineNumber,
//     colNumber
//   });
//   if (oldWindowOnError)
//     return oldWindowOnError(arguments);
//   return false; // Continue error propagation
// };
//
// const oldConsoleError = console.error;
//
// console.error = function () {
//   const args = [...arguments];
//   consoleMessages.push(new ConsoleMessage(messageTypes.ERROR, args));
//   oldConsoleError.apply(console, args);
// };
//
// const oldConsoleWarn = console.warn;
//
// console.warn = function () {
//   const args = [...arguments];
//   consoleMessages.push(new ConsoleMessage(messageTypes.WARN, args));
//   oldConsoleWarn.apply(console, args);
// };


export {
  getBrowserInfo,
  getConsoleInfo,
  getUncaughtErrorsInfo,
}
