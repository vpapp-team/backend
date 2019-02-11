/* eslint-disable max-len, no-await-in-loop */
const FS = require('fs');
const PATH = require('path');
const CRYPTO = require('crypto');
const READLINE = require('readline');
const LOGGER = require('backend-logger');
const UTIL = require('../util.js')

exports.name = 'proxy';
exports.source = 'https://github.com/vpapp-team/backend-proxy';
exports.description = 'The optional load balancing Proxy';
exports.install = async() => {
  LOGGER.logClean('installing proxy');
  const cfg = { general: {}, endpoints: [] };
  LOGGER.logClean('availablility:');
  cfg.general.listenHttp = await UTIL.readStdin('  listen for incoming http requests? (y|n)', UTIL.isBool, 'y') === 'y';
  cfg.general.redirectHttp = !cfg.general.listenHttp ? false : await UTIL.readStdin('  redirect incoming http requests to https? (y|n)', UTIL.isBool, 'y') === 'y';
  cfg.general.httpPorts = !cfg.general.listenHttp ? [] : (await UTIL.readStdin(`  http ports to ${cfg.general.redirectHttp ? 'redirect on' : 'listen on'}?`, UTIL.isUIntList, '80,8080')).split(',').map(a => Number(a));
  cfg.general.httpsPorts = [];
  cfg.general.SECURE_CONTEXT = null;
  if (!cfg.general.listenHttp ||
    cfg.general.redirectHttp ||
    await UTIL.readStdin('  setup https? (y|n)', UTIL.isBool, 'n') === 'y'
  ) {
    if (!cfg.general.listenHttp) LOGGER.logClean(' !enforcing https since you set listenHttp to false');
    if (cfg.general.redirectHttp) LOGGER.logClean(' !enforcing https since you set redirectHttp to true');
    cfg.general.httpsPorts = (await UTIL.readStdin(`  https ports to listen on?`, UTIL.isUIntList, '443,8443')).split(',').map(a => Number(a));
    cfg.general.SECURE_CONTEXT = {};
    cfg.general.SECURE_CONTEXT.key = PATH.resolve(await UTIL.readStdin(`  https (priv)key?`, line => FS.existsSync(line), '/etc/letsencrypt/live/<domain>/privkey.pem'));
    cfg.general.SECURE_CONTEXT.cert = PATH.resolve(await UTIL.readStdin(`  https cert?`, line => FS.existsSync(line), '/etc/letsencrypt/live/<domain>/cert.pem'));
    cfg.general.SECURE_CONTEXT.ca = PATH.resolve(await UTIL.readStdin(`  https ports ca(fullchain)?`, line => FS.existsSync(line), '/etc/letsencrypt/live/<domain>/fullchain.pem'));
  }
  LOGGER.logClean('communication:');
  cfg.general.maxServerAge = Number(await UTIL.readStdin('  milliseconds after which a server gets invalidated if it doesnt reauth?', UTIL.isUInt, '300000'));
  if (await UTIL.readStdin('  Already have a key pair to validate register requests? (y|n)', UTIL.isBool, 'n') === 'y') {
    cfg.general.publicKey = FS.readFileSync(await UTIL.readStdin(`  location of your public key?`, line => FS.existsSync(line), '/path/to/publickey/pubkey.pem'));
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
  cfg.general.registration = UTIL.parseClientLocation(await UTIL.readStdin(`  location to register on this proxy? format: <method>@<hostname><:port default all><url default '/'>?`, UTIL.isClientLocation, 'SUBSCRIBE@proxy.nigb.app/login'));
  cfg.general.broadcast = UTIL.parseClientLocation(await UTIL.readStdin(`  location to broadcast on this proxy? format: <method>@<hostname><:port default all><url default '/'>?`, UTIL.isClientLocation, 'NOTIFY@broadcast.nigb.app'));
  while (!cfg.endpoints.length || await UTIL.readStdin('  Want to add another endpoint? (y|n)', UTIL.isBool, 'n') === 'y') {
    cfg.endpoints.push(UTIL.parseEndpoint(await UTIL.readStdin('  Enter an endpoint: <hostname @=default>,<allowUnsecure (y|n)>', UTIL.isEndpoint, '@,n')));
  }
  const n = PATH.resolve(__dirname, `../proxy-${new Date().getDay()}-${new Date().getMonth()}-${new Date().getFullYear()}-${Date.now()}.json`);
  const l = 100 - (16 + n.length);
  FS.writeFileSync(n, JSON.stringify(cfg, null, 2));
  LOGGER.logClean(` \n ${'*'.repeat(100)}\n *${' '.repeat(98)}*\n * SAVED CFG AS ${n}${' '.repeat(l < 0 ? 0 : l)}*\n *${' '.repeat(98)}*\n ${'*'.repeat(100)}\n`);
};
