/* eslint-disable max-len, no-await-in-loop */
const FS = require('fs');
const URL = require('url');
const PATH = require('path');
const CRYPTO = require('crypto');
const READLINE = require('readline');
const LOGGER = require('backend-logger');

exports.name = 'proxy';
exports.source = 'https://github.com/vpapp-team/backend-proxy';
exports.description = 'The optional load balancing Proxy';
exports.install = async() => {
  LOGGER.logClean('installing proxy');
  const cfg = { general: {}, endpoints: [] };
  LOGGER.logClean('availablility:');
  cfg.general.listenHttp = await readStdin('  listen for incoming http requests? (y|n)', util.isBool, 'y') === 'y';
  cfg.general.redirectHttp = !cfg.general.listenHttp ? false : await readStdin('  redirect incoming http requests to https? (y|n)', util.isBool, 'y') === 'y';
  cfg.general.httpPorts = !cfg.general.listenHttp ? [] : (await readStdin(`  http ports to ${cfg.general.redirectHttp ? 'redirect on' : 'listen on'}?`, util.isUIntList, '80,8080')).split(',').map(a => Number(a));
  cfg.general.httpsPorts = [];
  cfg.general.SECURE_CONTEXT = null;
  if (!cfg.general.listenHttp ||
    cfg.general.redirectHttp ||
    await readStdin('  setup https? (y|n)', util.isBool, 'n') === 'y'
  ) {
    if (!cfg.general.listenHttp) LOGGER.logClean(' !enforcing https since you set listenHttp to false');
    if (cfg.general.redirectHttp) LOGGER.logClean(' !enforcing https since you set redirectHttp to true');
    cfg.general.httpsPorts = (await readStdin(`  https ports to listen on?`, util.isUIntList, '443,8443')).split(',').map(a => Number(a));
    cfg.general.SECURE_CONTEXT = {};
    cfg.general.SECURE_CONTEXT.key = PATH.resolve(await readStdin(`  https (priv)key?`, line => !FS.existsSync(line), '/etc/letsencrypt/live/<domain>/privkey.pem'));
    cfg.general.SECURE_CONTEXT.cert = PATH.resolve(await readStdin(`  https cert?`, line => !FS.existsSync(line), '/etc/letsencrypt/live/<domain>/cert.pem'));
    cfg.general.SECURE_CONTEXT.ca = PATH.resolve(await readStdin(`  https ports ca(fullchain)?`, line => !FS.existsSync(line), '/etc/letsencrypt/live/<domain>/fullchain.pem'));
  }
  LOGGER.logClean('communication:');
  cfg.general.maxServerAge = Number(await readStdin('  milliseconds after which a server gets invalidated if it doesnt reauth?', util.isUInt, '300000'));
  if (await readStdin('  Already have a key pair to validate register requests? (y|n)', util.isBool, 'n') === 'y') {
    cfg.general.publicKey = FS.readFileSync(await readStdin(`  location of your public key?`, line => FS.existsSync(line), '/path/to/publickey/pubkey.pem'));
  } else {
    const { publicKey, privateKey } = CRYPTO.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    cfg.general.publicKey = publicKey;
    const n = PATH.resolve(__dirname, '../privkey.pem');
    FS.writeFileSync(n, privateKey);
    const l = 100 - (24 + n.length);
    LOGGER.logClean(` \n ${'*'.repeat(100)}\n *${' '.repeat(98)}*\n * PRIVATE KEY SAVED IN ${n}${' '.repeat(l < 0 ? 0 : l)}*\n *${' '.repeat(98)}*\n ${'*'.repeat(100)}\n`);
  }
  cfg.general.registration = util.parseClientLocation(await readStdin(`  location to register on this proxy? format: <method>@<hostname><:port default all><url default '/'>?`, util.isClientLocation, 'SUBSCRIBE@proxy.nigb.app/login'));
  cfg.general.broadcast = util.parseClientLocation(await readStdin(`  location to broadcast on this proxy? format: <method>@<hostname><:port default all><url default '/'>?`, util.isClientLocation, 'NOTIFY@broadcast.nigb.app'));
  while (!cfg.endpoints.length || await readStdin('  Want to add another endpoint? (y|n)', util.isBool, 'n') === 'y') {
    cfg.endpoints.push(util.parseEndpoint(await readStdin('  Enter an endpoint: <hostname @=default>,<allowUnsecure (y|n)>', util.isEndpoint, '@,n')));
  }
  const n = PATH.resolve(__dirname, `../proxy-${new Date().getDay()}-${new Date().getMonth()}-${new Date().getFullYear()}-${Date.now()}.json`);
  const l = 100 - (16 + n.length);
  FS.writeFileSync(n, JSON.stringify(cfg, null, 2));
  LOGGER.logClean(` \n ${'*'.repeat(100)}\n *${' '.repeat(98)}*\n * SAVED CFG AS ${n}${' '.repeat(l < 0 ? 0 : l)}*\n *${' '.repeat(98)}*\n ${'*'.repeat(100)}\n`);
};

const readStdin = (q, validateFN, def) => new Promise(resolve => {
  const rl = READLINE.createInterface(process.stdin, process.stdout);
  rl.setPrompt(`${q}> `);
  rl.prompt();
  rl.write(def);
  rl.on('line', line => {
    if (validateFN(line)) {
      rl.close();
      return resolve(line);
    }
    rl.prompt();
    return rl.write(def);
  });
});

const util = {
  isBool: line => ['y', 'n'].includes(line),
  parseEndpoint: line => {
    const parts = line.split(',');
    return {
      hostname: parts[0],
      allowUnsecure: parts[1] === 'y',
    };
  },
  isEndpoint: line => {
    const parts = line.split(',');
    if (!util.isBool(parts[1])) return false;
    if (!parts[0].match(/^@$|^[a-zA-Z]+([-a-zA-Z.][a-zA-Z]+)*$/)) return false;
    return true;
  },
  isUInt: line => !isNaN(line) && Number(line) > 0 && Number(line) === Math.floor(Number(line)),
  isUIntList: line => !line.split(',').some(a => !util.isUInt(a)),
  isClientLocation: line => {
    const parts = line.split('@');
    if (!parts[0].match(/^[A-Z]+$/)) return false;
    const u = URL.parse(`https://${parts[1]}`);
    if (!u.hostname) return false;
    if (!u.path) return false;
    return true;
  },
  parseClientLocation: line => {
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
  },
};
