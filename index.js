const PATH = require('path');
const UTIL = require('backend-util');
const MINIMIST = require('minimist');
const READLINE = require('readline');
const LOGGER = require('backend-logger');

const argv = MINIMIST(process.argv.splice(2));
const setuppers = UTIL.loader(PATH.resolve(__dirname, './setuppers/'));

const readStdin = (q, validateFN) => new Promise(resolve => {
  const rl = READLINE.createInterface(process.stdin, process.stdout);
  rl.setPrompt(`${q}> `);
  rl.prompt();
  rl.on('line', line => {
    if (validateFN(line)) {
      rl.close();
      return resolve(line);
    }
    return rl.prompt();
  });
});

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
      const selected = await readStdin('module:', line => !!s[Number(line)]);
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
