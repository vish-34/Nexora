const weatherService = require("./weatherService");

module.exports = {
  calculateWBGT: weatherService.calculateWBGT,
  wbgtBand: weatherService.wbgtBand,
  getAlertLevel: weatherService.getAlertLevel,
};
