const READLINE = require('readline');
const URL = require('url');
const FS = require('fs');

exports.mysqlRegex = /^[$a-zA-Z0-9_]+$/
const hostnameRegex = exports.hostnameRegex = /^@$|^[0-9a-zA-Z]+([-0-9a-zA-Z.][0-9a-zA-Z]+)*$|^([0-9]{1,3}\.){2}[0-9]{1,3}$///
const isBool = exports.isBool = line => ['y', 'n'].includes(line);

exports.existsFile = line => {
    return FS.existsSync(line) && FS.statSync(line).isFile();
  }

exports.parseEndpoint = line => {
    const parts = line.split(',');
    return {
      hostname: parts[0],
      allowUnsecure: parts[1] === 'y',
    };
  };

exports.isEndpoint = line => {
    const parts = line.split(',');
    if (!isBool(parts[1])) return false;
    if (!parts[0].match(hostnameRegex)) return false;
    return true;
  };

const isUInt = exports.isUInt = line => !isNaN(line) && Number(line) > 0 && Number(line) === Math.floor(Number(line));

exports.isUIntList = line => !line.split(',').some(a => !isUInt(a));

exports.isClientLocation = line => {
    const parts = line.split('@');
    if (!parts[0].match(/^[A-Z]+$/)) return false;
    const u = URL.parse(`https://${parts[1]}`);
    if (!u.hostname) return false;
    if (!u.path) return false;
    return true;
  };

exports.parseClientLocation = line => {
    const parts = line.split('@');
    const u = URL.parse(`https://${parts[1]}`);
    const a = {
      hostname: u.hostname,
      port: u.port,
      method: parts[0],
      path: u.path,
    };
    if (!a.port) delete a.port;
    if (!a.url || a.url === '/') delete a.url;
    return a;
  };

exports.readStdin = (q, validateFN, def) => new Promise(resolve => {
    const rl = READLINE.createInterface(process.stdin, process.stdout);
    rl.setPrompt(`${q}> `);
    rl.prompt();
    if(def !== undefined) rl.write(def);
    rl.on('line', line => {
      if (validateFN(line)) {
        rl.close();
        return resolve(line);
      }
      if(def !== undefined) {
        rl.prompt();
        return rl.write(def);
      }
      else {
        return rl.prompt();
      }
    });
  });
