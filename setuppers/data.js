/* eslint-disable max-len, no-await-in-loop */
const LOGGER = new (require('backend-logger'))();
const UTIL = require('../util.js');
const PATH = require('path');
const FS = require('fs');

exports.name = 'data';
exports.source = 'https://github.com/vpapp-team/backend-data';
exports.description = 'The Handler for pulling new data from nig-bederkesa.de';
exports.install = async() => {
  LOGGER.logClean('installing data');
  const cfg = { mysql_readwrite: {}, snowflake: {}, MODULES: {} };
  LOGGER.logClean('mysql:');
  cfg.mysql_readwrite.connectionLimit = Number(await UTIL.readStdin('  mysql connection limit?', UTIL.isUInt, '10'));
  cfg.mysql_readwrite.charset = await UTIL.readStdin('  mysql character set?', line => !!line.match(/^[-a-zA-Z0-9_]+$/), 'UTF8MB4_GENERAL_CI');
  if (await UTIL.readStdin('  use default sql table names? (y|n)', UTIL.isBool, 'y') !== 'y') {
    cfg.mysql_readwrite.tables = {};
    cfg.mysql_readwrite.tables.CALENDAR = await UTIL.readStdin('  name for Calendar table?', line => !!line.match(UTIL.mysqlRegex), 'CalendarEvents');
    cfg.mysql_readwrite.tables.ERRORS = await UTIL.readStdin('  name for Error table?', line => !!line.match(UTIL.mysqlRegex), 'Errors');
    cfg.mysql_readwrite.tables.FEEDBACK = await UTIL.readStdin('  name for Feedback table?', line => !!line.match(UTIL.mysqlRegex), 'Feedback');
    cfg.mysql_readwrite.tables.UPDATES = await UTIL.readStdin('  name for LastUpdate table?', line => !!line.match(UTIL.mysqlRegex), 'LastUpdate');
    cfg.mysql_readwrite.tables.LESSONRANGES = await UTIL.readStdin('  name for LessonRanges table?', line => !!line.match(UTIL.mysqlRegex), 'LessonRanges');
    cfg.mysql_readwrite.tables.MENU = await UTIL.readStdin('  name for Menu table?', line => !!line.match(UTIL.mysqlRegex), 'Menu');
    cfg.mysql_readwrite.tables.STANDINS = await UTIL.readStdin('  name for StandIn table?', line => !!line.match(UTIL.mysqlRegex), 'StandIn');
    cfg.mysql_readwrite.tables.TEACHERS = await UTIL.readStdin('  name for Teacher table?', line => !!line.match(UTIL.mysqlRegex), 'Teacher');
    cfg.mysql_readwrite.tables.TIMETABLE = await UTIL.readStdin('  name for Timetable table?', line => !!line.match(UTIL.mysqlRegex), 'Timetable');
    cfg.mysql_readwrite.tables.VERSIONS = await UTIL.readStdin('  name for Endpoints table?', line => !!line.match(UTIL.mysqlRegex), 'Endpoints');
    cfg.mysql_readwrite.tables.BACKENDS = await UTIL.readStdin('  name for Backends table?', line => !!line.match(UTIL.mysqlRegex), 'Backends');
    cfg.mysql_readwrite.tables.WEBADMINS = await UTIL.readStdin('  name for WebAdmins table?', line => !!line.match(UTIL.mysqlRegex), 'WebAdmins');
  } else {
    cfg.mysql_readwrite.tables = {
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
  cfg.mysql_readwrite.hostname = await UTIL.readStdin('  mysql servers hostname?', line => !!line.match(UTIL.hostnameRegex), 'mysql.nigb.app');
  cfg.mysql_readwrite.port = Number(await UTIL.readStdin('  mysql servers port?', UTIL.isUInt, '3306'));
  cfg.mysql_readwrite.user = await UTIL.readStdin('  mysql servers (read & write) username?', line => line.length > 0);
  cfg.mysql_readwrite.password = await UTIL.readStdin('  mysql servers (read & write) password?', line => line.length > 0);
  cfg.mysql_readwrite.database = await UTIL.readStdin('  mysql database name?', line => !!line.match(UTIL.mysqlRegex), 'NIGB');
  LOGGER.logClean('snowflake:');
  cfg.snowflake.epoche = Number(await UTIL.readStdin('  snowflake epoche?', UTIL.isUInt, '1515151515151'));
  cfg.snowflake.datacenter = Number(await UTIL.readStdin('  snowflake datacenter id?', line => UTIL.isUInt(line) && Number(line) < 16, Math.floor((Math.random() * 15) + 1).toString()));
  cfg.snowflake.hostname = await UTIL.readStdin('  hostname to use for generated snowflakes?', line => !!line.match(UTIL.hostnameRegex), 'ap1.nigb.app');
  LOGGER.logClean('module setup:');
  cfg.MODULES.Calendar = [];
  LOGGER.logClean('  Calendar Module:');
  const CAL_UUID_FORMATER = '/-schulferien\\.eu$/g/@schulferien.eu/';
  const CAL_DEFAULTS = [{
    uuid: 'ferien2018',
    ref: 'https://www.schulferien.eu/downloads/ical4.php?land=3&type=1&year=2018',
    uuidFormater: CAL_UUID_FORMATER,
  }, {
    uui: 'ferien2019',
    ref: 'https://www.schulferien.eu/downloads/ical4.php?land=3&type=1&year=2019',
    uuidFormater: CAL_UUID_FORMATER,
  }, {
    uuid: 'feiertage2018',
    ref: 'https://www.schulferien.eu/downloads/ical4.php?land=NI&type=0&year=2018',
    uuidFormater: CAL_UUID_FORMATER,
  }, {
    uuid: 'feiertage2019',
    ref: 'https://www.schulferien.eu/downloads/ical4.php?land=NI&type=0&year=2019',
    uuidFormater: CAL_UUID_FORMATER,
  }, {
    uuid: 'schoolMain',
    ref: 'https://nigb.de/caldav/+public/calendar',
  }];
  while (await UTIL.readStdin('    Want to add another Calendar? (y|n)', UTIL.isBool, CAL_DEFAULTS.length ? 'y' : 'n') === 'y') {
    let template = CAL_DEFAULTS.pop();
    let cal = {};
    cal.uuid = await UTIL.readStdin('      unique identifier for the cal?', line => !!line.match(UTIL.hostnameRegex), template.uuid || 'newCal');
    cal.ref = await UTIL.readStdin('      the link to the cal?', line => !!line.match(UTIL.urlRegex), template.ref || 'https://cal.yours');
    cal.uuidFormater = UTIL.parseUUIDFormater(await UTIL.readStdin('    calendars uuidFormater? /<regex>/<flags>/<replacement>/', line => !line || line.split('/').length === 5, template.uuidFormater || '/'));
    cal.username = await UTIL.readStdin('      calendars username (if any)?', () => true);
    if (!cal.username) delete cal.username;
    cal.password = await UTIL.readStdin('      calendars password (if any)?', () => true);
    if (!cal.password) delete cal.password;
    cfg.MODULES.Calendar.push(cal);
  }
  LOGGER.logClean('other:');
  cfg.MAX_TIME_FOR_3_CRASHES = await UTIL.readStdin('  how long are 3 crashes allowed to be apart (time in min) before a module gets disabled?', UTIL.isUInt, '5');
  cfg.BROADCAST_DELAY_MIN = await UTIL.readStdin('  time (in minutes) to delay broadcasts to wait for other modules to finish?', UTIL.isUInt, '5');
  LOGGER.logClean('finished:');
  const n = PATH.resolve(__dirname, `../data-${new Date().getDay()}-${new Date().getMonth()}-${new Date().getFullYear()}-${Date.now()}.json`);
  const l = 100 - (16 + n.length);
  FS.writeFileSync(n, JSON.stringify(cfg, null, 2));
  LOGGER.logClean(` \n ${'*'.repeat(100)}\n *${' '.repeat(98)}*\n * SAVED CFG AS ${n}${' '.repeat(l < 0 ? 0 : l)}*\n *${' '.repeat(98)}*\n ${'*'.repeat(100)}\n`);
};
