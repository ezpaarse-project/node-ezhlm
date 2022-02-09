const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const set = require('lodash.set');
const has = require('lodash.has');

const logger = require('../lib/logger');

/**
 * create a config file in /$HOME/.config/ezhlm.json
 * which contains the information to request on ezhlm
 */
const setConfig = async () => {
  const pathConfig = path.resolve(os.homedir(), '.config', 'ezhlm.json');

  const config = {
    elastic: {
      baseURL: 'http://localhost:9200',
      username: 'elastic',
      password: 'changeme',
    },
    holdingsiq: {
      baseURL: 'http://localhost:8080',
      institutes: [],
    },
  };

  try {
    await fs.writeFile(pathConfig, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(config, null, 2)} in ${pathConfig}`);
    logger.error(err);
    process.exit(1);
  }
  logger.info(`configuration has been initialized in ${pathConfig}`);
};

const getConfig = async (customPath) => {
  let configPath = path.resolve(os.homedir(), '.config', 'ezhlm.json');
  if (customPath) {
    if (!await fs.pathExists(customPath)) {
      logger.error(`${customPath} doesn't exist`);
      process.exit(1);
    } else {
      configPath = customPath;
    }
  }
  let config;
  try {
    config = await fs.readFile(configPath, 'utf-8');
    config = JSON.parse(config);
  } catch (err) {
    logger.error(err);
  }
  return config;
};

/**
 * config management command to establish the connection between the command and ezhlm
 *
 * @param {boolean} args.get -g --get - display configuration
 * @param {boolean} args.set -s --set - update configuration file in $HOME/.config
 * @param {boolean} args.list -l --list - list of attributes required for configuration
 */
const manageConfig = async (args) => {
  if (args.list) {
    console.log(`
      baseURL
      username
      password
      institutes`.trim().replace(/^\s*/gm, ''));
    process.exit(0);
  }

  const configPath = path.resolve(os.homedir(), '.config', 'ezhlm.json');

  if (!await fs.pathExists(configPath)) {
    await setConfig();
  }

  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

  if (args.get) {
    console.log(JSON.stringify(config, null, 2));
    logger.info(`from ${configPath}`);
    process.exit(0);
  }

  if (args.set === 'default') {
    console.log(JSON.stringify(config, null, 2));
    await setConfig();
    process.exit(0);
  }

  if (args.set) {
    if (has(config, args.set)) {
      set(config, args.set, ...args.args);
    } else {
      logger.error(`${args.set} doesn't exist on config`);
      process.exit(1);
    }
  }

  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(config, null, 2)} in ${config}`);
    logger.error(err);
    process.exit(1);
  }

  console.log(JSON.stringify(config, null, 2));
  logger.info(`from ${configPath}`);
  process.exit(0);
};

module.exports = {
  manageConfig,
  getConfig,
  setConfig,
};
