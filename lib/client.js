const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const logger = require('./logger');

module.exports = {
  connection: async () => {
    const configPath = path.resolve(os.homedir(), '.config', '.ezhlmrc');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return new Client({
      node: {
        url: new URL(`${config.baseURL}`),
        auth: {
          username: config.user,
          password: config.password,
        },
      },
    });
  },
  getConfig: async (customPath) => {
    let configPath = path.resolve(os.homedir(), '.config', '.ezhlmrc');
    if (customPath) {
      if (!await fs.pathExists(customPath)) {
        logger.error(`${customPath}   exist`);
        process.exit(1);
      } else {
        configPath = customPath;
      }
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  },
};
