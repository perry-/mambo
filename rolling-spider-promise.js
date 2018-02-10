function thing(drone) {
  const funcs = Object.keys(drone.__proto__).filter(key => typeof drone[key] === 'function').map(key => {
    return {
      key,
      func: function(...rest) {
        return new Promise((resolve, reject) => {
          if (reset)
          drone[key](...rest, resolve);
        });
      }
    }
    return
  }).reduce((result, value) => {
    result[value.key] = value.func;
    return result;
  }, {});
  return funcs;
}


function promisify(drone) {
  const result = {};
  [
    'turnRight',
    'turnLeft',
    'forward',
    'backward',
    'left',
    'right',
    'up',
    'down'
  ].forEach(key => {
    result[key] = args => {
      return new Promise((resolve, reject) => {
        console.log(key);
        drone[key](args, () => {
          console.log(`Done ${key}`);
          resolve();
        });
      })
    }
  });

  [
    'connect',
    'setup',
    'flatTrim',
    'flatTrim',
    'takeOff',
    'flatTrim',
    'land',
    'disconnect'
  ].forEach(key => {
    result[key] = () => {
      return new Promise((resolve, reject) => {
        console.log(key);
        drone[key](() => {
          console.log(`Done ${key}`);
          resolve();
        });
      })
    }
  });
  [
    'startPing'
  ].forEach(key => {
    result[key] = () => {
      return new Promise((resolve, reject) => {
        console.log(key);
        drone[key]();
        console.log(`Done ${key}`);
        resolve();
      })
    }
  });
  return result;
}

module.exports = promisify;
