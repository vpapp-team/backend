/* eslint-disable max-len, no-await-in-loop */
const LOGGER = new (require('backend-logger'))();
const UUTIL = require('backend-util');
const FS = require('fs');
const HTTP = require('http');
const URL = require('url');
const PATH = require('path');
const UTIL = require('../util.js');

exports.name = 'api';
exports.source = 'https://github.com/vpapp-team/backend-api';
exports.description = 'The API Endpoints to use for the app';
exports.install = async() => {
  LOGGER.logClean('installing api');
  const cfg = { mysql_read: {}, snowflake: {}, serverConfig: {} };
  LOGGER.logClean('mysql:');
  cfg.mysql_read.connectionLimit = Number(await UTIL.readStdin('  mysql connection limit?', UTIL.isUInt, '10'));
  cfg.mysql_read.charset = await UTIL.readStdin('  mysql character set?', line => !!line.match(/^[-a-zA-Z0-9_]+$/), 'UTF8MB4_GENERAL_CI');
  if (await UTIL.readStdin('  use default sql table names? (y|n)', UTIL.isBool, 'y') !== 'y') {
    cfg.mysql_read.tables = {};
    cfg.mysql_read.tables.CALENDAR = await UTIL.readStdin('  name for Calendar table?', line => !!line.match(UTIL.mysqlRegex), 'CalendarEvents');
    cfg.mysql_read.tables.ERRORS = await UTIL.readStdin('  name for Error table?', line => !!line.match(UTIL.mysqlRegex), 'Errors');
    cfg.mysql_read.tables.FEEDBACK = await UTIL.readStdin('  name for Feedback table?', line => !!line.match(UTIL.mysqlRegex), 'Feedback');
    cfg.mysql_read.tables.UPDATES = await UTIL.readStdin('  name for LastUpdate table?', line => !!line.match(UTIL.mysqlRegex), 'LastUpdate');
    cfg.mysql_read.tables.LESSONRANGES = await UTIL.readStdin('  name for LessonRanges table?', line => !!line.match(UTIL.mysqlRegex), 'LessonRanges');
    cfg.mysql_read.tables.MENU = await UTIL.readStdin('  name for Menu table?', line => !!line.match(UTIL.mysqlRegex), 'Menu');
    cfg.mysql_read.tables.STANDINS = await UTIL.readStdin('  name for StandIn table?', line => !!line.match(UTIL.mysqlRegex), 'StandIn');
    cfg.mysql_read.tables.TEACHERS = await UTIL.readStdin('  name for Teacher table?', line => !!line.match(UTIL.mysqlRegex), 'Teacher');
    cfg.mysql_read.tables.TIMETABLE = await UTIL.readStdin('  name for Timetable table?', line => !!line.match(UTIL.mysqlRegex), 'Timetable');
    cfg.mysql_read.tables.VERSIONS = await UTIL.readStdin('  name for Endpoints table?', line => !!line.match(UTIL.mysqlRegex), 'Endpoints');
    cfg.mysql_read.tables.BACKENDS = await UTIL.readStdin('  name for Backends table?', line => !!line.match(UTIL.mysqlRegex), 'Backends');
    cfg.mysql_read.tables.WEBADMINS = await UTIL.readStdin('  name for WebAdmins table?', line => !!line.match(UTIL.mysqlRegex), 'WebAdmins');
  } else {
    cfg.mysql_read.tables = {
      CALENDAR: 'CalendarEvents',
      ERRORS: 'Errors',
      FEEDBACK: 'Feedback',
      UPDATES: 'LastUpdate',
      LESSONRANGES: 'LessonRanges',
      MENU: 'Menu',
      STANDINS: 'StandIn',
      TEACHERS: 'Teacher',
      TIMETABLE: 'Timetable',
      ENDPOINTS: 'Endpoints',
      BACKENDS: 'Backends',
      WEBADMINS: 'WebAdmins',
    };
  }
  cfg.mysql_read.hostname = await UTIL.readStdin('  mysql servers hostname?', line => !!line.match(UTIL.hostnameRegex), 'mysql.nigb.app');
  cfg.mysql_read.port = Number(await UTIL.readStdin('  mysql servers port?', UTIL.isUInt, '3306'));
  cfg.mysql_read.user = await UTIL.readStdin('  mysql servers (read) username?', line => line.length > 0);
  cfg.mysql_read.password = await UTIL.readStdin('  mysql servers (read) password?', line => line.length > 0);
  cfg.mysql_read.database = await UTIL.readStdin('  mysql database name?', line => !!line.match(UTIL.mysqlRegex), 'NIGB');
  LOGGER.logClean('snowflake:');
  cfg.snowflake.epoche = Number(await UTIL.readStdin('  snowflake epoche?', UTIL.isUInt, '1515151515151'));
  cfg.snowflake.datacenter = Number(await UTIL.readStdin('  snowflake datacenter id?', line => UTIL.isUInt(line) && Number(line) < 16, Math.floor((Math.random() * 15) + 1).toString()));
  cfg.snowflake.hostname = await UTIL.readStdin('  hostname to use for generated snowflakes?', line => !!line.match(UTIL.hostnameRegex), 'ap1.nigb.app');
  LOGGER.logClean('accessibility:');
  cfg.serverConfig.port = Number(await UTIL.readStdin('  port to listen on?', UTIL.isUInt, '1337'));
  cfg.serverConfig.https = await UTIL.readStdin('  use https when listening? (y|n)', UTIL.isBool, 'n') === 'y';
  if (cfg.serverConfig.https) {
    cfg.SECURE_CONTEXT = {};
    cfg.SECURE_CONTEXT.key = PATH.resolve(await UTIL.readStdin(`  https (priv)key?`, line => UTIL.existsFile(line), '/etc/letsencrypt/live/<domain>/privkey.pem'));
    cfg.SECURE_CONTEXT.cert = PATH.resolve(await UTIL.readStdin(`  https cert?`, line => UTIL.existsFile(line), '/etc/letsencrypt/live/<domain>/cert.pem'));
    cfg.SECURE_CONTEXT.ca = PATH.resolve(await UTIL.readStdin(`  https ports ca(fullchain)?`, line => UTIL.existsFile(line), '/etc/letsencrypt/live/<domain>/fullchain.pem'));
  }
  LOGGER.logClean('other:');
  cfg.BACKUP_DATA_CHECK_INTERVAL = Number(await UTIL.readStdin('  interval to check for change in data?', UTIL.isUInt, '3600000'));
  LOGGER.logClean('proxy:');
  if (await UTIL.readStdin('  use a proxy with your api server? (y|n)', UTIL.isBool, 'n') === 'y') {
    cfg.serverConfig.hostname = await UTIL.readStdin('  api\'s own hostname?', line => !!line.match(UTIL.hostnameRegex), 'api1.nigb.app');
    cfg.serverConfig.method = await UTIL.readStdin('  method to use with validation request?', line => HTTP.METHODS.includes(line), '');
    cfg.serverConfig.path = URL.parse(await UTIL.readStdin('  path to use with validation request?', line => !!URL.parse(line).path, '')).path;
    cfg.serverConfig.receiveEP = (await UTIL.readStdin('  hostnames of endpoints to receive requests from?', line => !line.split(',').some(a => !a.match(UTIL.hostnameRegex)), 'api')).split(',');
    cfg.serverConfig.broadcastEP = (await UTIL.readStdin('  hostnames of endpoints to receive broadcasts from?', line => !line.split(',').some(a => !a.match(UTIL.hostnameRegex)), 'api')).split(',');
    cfg.serverConfig.signature = UUTIL.sign(JSON.stringify(cfg.serverConfig), FS.readFileSync(await UTIL.readStdin(`  privatekey to sign the serverConfig with?`, line => UTIL.existsFile(line), process.cwd())));
    cfg.proxy = {};
    while (!cfg.proxy.port) {
      cfg.proxy = UTIL.parseClientLocation(
        await UTIL.readStdin(`  location of the proxy? format: <method>@<hostname><:port><url default '/'>?`, UTIL.isClientLocation, 'SUBSCRIBE@proxy.nigb.app:443/login')
      );
    }
    cfg.proxy.secure = await UTIL.readStdin('  use https to connect to the proxy? (y|n)', UTIL.isBool, 'y') !== 'y';
    if (cfg.proxy.secure) {
      cfg.ONLY_SIGNED_PROXY = await UTIL.readStdin('  does the proxy have to have a valid ssl cert? (y|n)', UTIL.isBool, 'y') !== 'y';
    }
    cfg.REGISTER_INTERVAL = Number(await UTIL.readStdin('  interval to register on proxy?', UTIL.isUInt, '300000'));
  }
  LOGGER.logClean('finished:');
  const n = PATH.resolve(__dirname, `../out/api-${new Date().getDay()}-${new Date().getMonth()}-${new Date().getFullYear()}-${Date.now()}.json`);
  const l = 100 - (16 + n.length);
  FS.writeFileSync(n, JSON.stringify(cfg, null, 2));
  LOGGER.logClean(` \n ${'*'.repeat(100)}\n *${' '.repeat(98)}*\n * SAVED CFG AS ${n}${' '.repeat(l < 0 ? 0 : l)}*\n *${' '.repeat(98)}*\n ${'*'.repeat(100)}\n`);
};
