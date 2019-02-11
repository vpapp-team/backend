const PATH = require('path');
const UTIL = require('backend-util');
const UUTIL = require('./util.js')
const MINIMIST = require('minimist');
const LOGGER = require('backend-logger');

const argv = MINIMIST(process.argv.splice(2));
const setuppers = UTIL.loader(PATH.resolve(__dirname, './setuppers/'));

(async function main() {
  if (argv._[0] === 'setup') {
    if (setuppers.has(argv.m)) {
      LOGGER.logClean(`module: ${argv.m}`);
      setuppers.get(argv.m).install();
    } else {
      const s = setuppers.array();
      const padLength = s.concat().sort((a, b) => b.name.length - a.name.length)[0].name.length;
      LOGGER.logClean('available modules:');
      LOGGER.logClean(s.map((a, i) => `${i}: ${a.name.padEnd(padLength)} | ${a.description}`).join('\n'));
      const selected = await UUTIL.readStdin('module:', line => !!s[Number(line)]);
      s[selected].install();
    }
  } else {
    LOGGER.errorClean(`Usage:
  backend <option>

  <option>:
    setup
      -m <module: api|data|proxy>`);
    process.exit(1);
  }
}());
