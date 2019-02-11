const LOGGER = new (require('backend-logger'))();
const UTIL = require('../util.js');

exports.name = 'api';
exports.source = 'https://github.com/vpapp-team/backend-api';
exports.description = 'The API Endpoints to use for the app';
exports.install = async () => {
  LOGGER.logClean('installing api');
  const cfg = { mysql_read: {}, snowflake: {}, serverConfig: {} };
  LOGGER.logClean('mysql:');
  cfg.mysql_read.connectionLimit = Number(await UTIL.readStdin('  mysql connection limit?', UTIL.isUInt, '10'));
  cfg.mysql_read.charset = await UTIL.readStdin('  mysql character set?', line => !!line.match(/^[-a-zA-Z0-9_]+$/), 'UTF8MB4_GENERAL_CI');
  if(await UTIL.readStdin('  use default sql table names? (y|n)', UTIL.isBool, 'y') !== 'y') {
    cfg.mysql_read.tables = {}
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
    }
  }
  cfg.mysql_read.hostname = await UTIL.readStdin('  mysql servers hostname?', line => !!line.match(UTIL.hostnameRegex), 'mysql.nigb.app');
  cfg.mysql_read.port = Number(await UTIL.readStdin('  mysql servers port?', UTIL.isUInt, '3306'));
  cfg.mysql_read.user = await UTIL.readStdin('  mysql servers username?', line => line.length > 0);
  cfg.mysql_read.password = await UTIL.readStdin('  mysql servers password?', line => line.length > 0);
  cfg.mysql_read.database = await UTIL.readStdin('  mysql database name?', line => !!line.match(UTIL.mysqlRegex), 'NIGB');
  LOGGER.logClean('snowflake:');
  cfg.snowflake.epoche = Number(await UTIL.readStdin('  snowflake epoche?', UTIL.isUInt, '1515151515151'));
  cfg.snowflake.datacenter = Number(await UTIL.readStdin('  snowflake datacenter id?', line => UTIL.isUInt(line) && Number(line) < 16, Math.floor(Math.random()*15 + 1).toString()));

  cfg.serverConfig.port = 1337;
  cfg.serverConfig.https = ;
  cfg.serverConfig.validateCert = ;
  cfg.BACKUP_DATA_CHECK_INTERVAL = ;

// when using a proxy:
  // cfg.snowflake.hostname = ;
  // cfg.serverConfig.isSameServer = ;
  // cfg.serverConfig.hostname = ;
  // cfg.serverConfig.method = ;
  // cfg.serverConfig.path = ;
  // cfg.serverConfig.receiveEP = ;
  // cfg.serverConfig.broadcastEP = ;
  // cfg.proxy = {};
  // cfg.proxy.secure = ;
  // cfg.proxy.port = ;
  // cfg.ONLY_SIGNED_PROXY = ;
  // cfg.REGISTER_INTERVAL = ;
// when hosting via https
  // cfg.SECURE_CONTEXT = ;
  console.log(cfg);
};
