'use strict';

var RollingSpider = require('rolling-spider');
var temporal = require('temporal');
var rollingSpider = new RollingSpider({"uuid": "88c48c84cf7b4277ad4425041118d335"});

rollingSpider.connect(function () {
  rollingSpider.setup(function () {
    rollingSpider.flatTrim();
    rollingSpider.startPing();
    rollingSpider.flatTrim();

    temporal.queue([
      {
        delay: 0,
        task: function () {
          rollingSpider.takeOff();
        }
      },
      {
        delay: 5000,
        task: function () {
          rollingSpider.frontFlip();
        }
      },
      {
        delay: 5000,
        task: function () {
          rollingSpider.backFlip();
        }
      },
      {
        delay: 5000,
        task: function () {
          rollingSpider.land();
        }
      },
      {
        delay: 5000,
        task: function () {
          temporal.clear();
          process.exit(0);
        }
      }
    ]);
  });
});
