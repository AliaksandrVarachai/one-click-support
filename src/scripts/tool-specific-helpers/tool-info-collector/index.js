let getInfo;

switch (process.env.NODE_TOOL) {
  case 'tableau':
    getInfo = require('./tableau');
    break;
  default:
    throw Error(`process.env.NODE_TOOL contains wrong value "${process.env.NODE_TOOL}"`);
}

export default getInfo.default;
