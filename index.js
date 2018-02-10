'use strict';

const temporal = require('temporal');
const Drone = require('parrot-minidrone');
const discovery = require('./discovery');
const docopt = require('docopt');
const promisify = require('./rolling-spider-promise');

var stdin = process.openStdin();

const drones = new Map();

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}


async function connect(droneName) {
  console.log('Welcome to Drony');
  console.log(`Connecting to ${droneName}`)
  if (!drones.has(droneName)) {
    // const droneDetails = await discovery.use(droneName);
    const drone = new Drone({ autoconnect: false, droneFilter: droneName });
    drone.connect();
    drone.on('connected', data => {
      drones.set(droneName, drone);
      console.log(`Connected to ${droneName}`, data);
    });
  }
}

async function takeOff(droneName, drone) {
  console.log('Taking off');
  drone.takeOff();
  await sleep(1000)
}

async function land(droneName, drone) {
  console.log('Land')
  await drone.land();
}

function setSpeed(speed, controls) {
  return {
    roll: controls.roll * speed,
    pitch: controls.pitch * speed,
    yaw: controls.yaw * speed,
    altitude: controls.altitude * speed,
  }
}

async function move(droneName, drone, args) {
  const doc = `
    usage:
      move [options] <directions>...

    options:
      --time <time>    time [default: 500]
      --speed <speed>  speed [default: 3]
  `;

  const options = docopt.docopt(doc, { argv: args, options_first: true, exit: false });

  const directions = options['<directions>'];
  const time = parseFloat(options['--time']);
  const speed = parseFloat(options['--speed']);
  const valid = new Map([
    ['forward', { roll: 0, pitch: 1, yaw: 0 }],
    ['backward', { roll: 0, pitch: -1, yaw: 0 }],
    ['left', { roll: -1, pitch: 0, yaw: 0 }],
    ['right', { roll: 1, pitch: 0, yaw: 0 }],
    ['hover', { roll: 0, pitch: 0, yaw: 0, altitude: 0 }],
    ['up', { roll: 0, pitch: 0, yaw: 0, altitude: 1 }],
    ['down', { roll: 0, pitch: 0, yaw: 0, altitude: -1 }],
  ]);

  for (let direction of directions) {
    console.log(`Moving ${direction}`);
    const controls = valid.get(direction);
    if (controls) {

      drone.setFlightParams(setSpeed(speed, controls));
      await sleep(time);
      drone.setFlightParams(valid.get('hover'))
    }
  }
}

function checkDrone(func) {
  return function(droneName, args) {
    const drone = drones.get(droneName);
    if (drone) {
      return func(droneName, drone, args);
    }
    console.log(`${droneName} not connected`);
  }
}

async function showOff(droneName) {
  await commands.connect(droneName);
  commands.takeOff(droneName);
  await commands.move(droneName, ['--time', '1000', '--speed', '15', 'forward', 'left', 'backward', 'right' ]);
  await commands.land(droneName);
}

const commands = {
  connect,
  takeOff: checkDrone(takeOff),
  land: checkDrone(land),
  move: checkDrone(move),
  showOff
}

const doc = `
Usage:
  drone <command> [<args>...]
`;

stdin.addListener('data', async data => {
  try {
    const args = docopt.docopt(doc, { argv: data.toString().trim(), options_first: true, exit: false });
    const command = args['<command>'];
    // const droneName = args['<name>'];
    const droneName = 'Mambo_612477'
    const commandArgs = args['<args>'];
    await commands[command](droneName, commandArgs);
  } catch (e) {
    console.log(e);
  }
});
