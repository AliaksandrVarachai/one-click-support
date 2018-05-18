let screenshotHandler;

switch (process.env.NODE_TOOL) {
  case 'tableau':
    screenshotHandler = require('./tableau');
    break;
  default:
    throw Error(`process.env.NODE_TOOL contains wrong value "${process.env.NODE_TOOL}"`);
}

export default screenshotHandler.default;
