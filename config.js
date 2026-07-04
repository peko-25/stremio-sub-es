const { AsyncLocalStorage } = require('async_hooks');
const als = new AsyncLocalStorage();

const DEFAULTS = { mode: 'auto', primary: 'any', lang: 'spa', baseUrl: 'http://127.0.0.1:7000' };

function runWithConfig(config, fn) {
  return als.run({ ...DEFAULTS, ...config }, fn);
}

function getConfig() {
  return als.getStore() || { ...DEFAULTS };
}

module.exports = { runWithConfig, getConfig };
