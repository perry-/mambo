'use strict';

const temporal = require('temporal');
const Drone = require('rolling-spider');
const discovery = require('./discovery');
const docopt = require('docopt');
const promisify = require('./rolling-spider-promise');

var stdin = process.openStdin();

const drones = new Map();

async function connect(droneName) {
  console.log(`Connecting to ${droneName}`)
  if (!drones.has(droneName)) {
    const droneDetails = await discovery.use(droneName);
    const temporal = require('temporal');
    const drone = promisify(new Drone(droneDetails));
    await drone.connect();
    await drone.setup();
    await drone.flatTrim();
  await drone.startPing();
    drones.set(droneName, drone)
    console.log(`Connected to ${droneName}`);
  }
}

async function takeOff(droneName, drone) {
  console.log('Taking off');
  await drone.takeOff();
  await drone.flatTrim();
}

async function land(droneName, drone) {
  console.log('Land')
  await drone.land();
  await drone.disconnect()
  await drones.delete(droneName);
}

async function move(droneName, drone, args) {
  console.log(args)
  const doc = `
    usage:
      move [options] <directions>...

    options:
      --delay <delay>  delay [default: 500]
      --speed <speed>  speed [default: 3]
      --steps <steps>  steps [default: 5]
  `;
  const options = docopt.docopt(doc, { argv: args, options_first: true, exit: false });

  const directions = options['<directions>'];
  const delay = parseFloat(options['--delay']);
  const valid = new Set([
    'turnRight',
    'turnLeft',
    'forward',
    'backward',
    'left',
    'right',
    'up',
    'down'
  ]);

  directions.forEach(async direction => {
    console.log(`Moving ${direction}`);
    await drone[direction]({ speed: parseFloat(options['--speed']), steps: parseFloat(options['--steps']) });
    await drone.flatTrim();
  });
}

async function turn(droneName, drone, args) {
  const doc = `
    usage:
      turn [--speed <speed>] [--steps <steps>] <direction>

    options:
      --speed <speed>  speed [default: 3]
      --steps <steps>  steps [default: 5]
  `;
  const options = docopt.docopt(doc, { argv: args, options_first: true, exit: false });

  console.log(options);

  const direction = options['<direction>'];
  const directions = new Map([['left', opt => drone.turnLeft(opt)], ['right', opt => drone.turnRight(opt)]]);
  await directions.get(direction)();
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
  await commands.move(droneName, [ '--speed', '30', '--steps', '20', 'forward', 'forward' ]);
  await commands.land(droneName);
}

const commands = {
  connect,
  takeOff: checkDrone(takeOff),
  land: checkDrone(land),
  move: checkDrone(move),
  turn: checkDrone(turn),
  showOff
}

const doc = `
Usage:
  drone <command> <name> [<args>...]
`;

stdin.addListener('data', async data => {
  try {
    const args = docopt.docopt(doc, { argv: data.toString().trim(), options_first: true, exit: false });
    const command = args['<command>'];
    const droneName = args['<name>'];
    const commandArgs = args['<args>'];
    await commands[command](droneName, commandArgs);
  } catch (e) {
    console.log(e);
  }
});
