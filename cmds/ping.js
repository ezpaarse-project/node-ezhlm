const { elasticClient } = require('../lib/client');
const logger = require('../lib/logger');

/**
 * check if elastic
 */
const ping = async () => {
  const client = elasticClient();
  let res;
  try {
    res = await client.ping();
  } catch (err) {
    logger.error(`Service unavailable ${client.baseURL}`);
    process.exit(1);
  }
  if (res?.statusCode !== 200 && res?.statusCode !== 302) {
    logger.error(`Cannot request ${client.baseURL}`);
    process.exit(1);
  }
  logger.info(`${client.baseURL} ping: OK`);
};

module.exports = {
  ping,
};
