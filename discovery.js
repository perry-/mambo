var Drone = require('rolling-spider');
var noble = require('noble');

function use(name) {
  return new Promise((resolve, reject) => {
    noble.startScanning();
    noble.on('discover', peripheral => {
      if (!Drone.isDronePeripheral(peripheral)) {
        return; // not a rolling spider
      }

      var details = {
        name: peripheral.advertisement.localName,
        uuid: peripheral.uuid,
        rssi: peripheral.rssi
      };
      if (details.name === name) {
        resolve(details)
      }
    });
  })
}

module.exports = { use };