let domInitializer;

switch (process.env.NODE_TOOL) {
  case 'tableau':
    domInitializer = require('./tableau');
    break;
  default:
    throw Error(`process.env.NODE_TOOL contains wrong value "${process.env.NODE_TOOL}"`);
}

export default domInitializer.default;
