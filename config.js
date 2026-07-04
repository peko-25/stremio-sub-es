const { AsyncLocalStorage } = require('async_hooks');
const crypto = require('crypto');
const als = new AsyncLocalStorage();

const DEFAULTS = { mode: 'auto', primary: 'any', lang: 'spa', baseUrl: 'http://127.0.0.1:7000' };
const storedConfigs = new Map();

function runWithConfig(config, fn) {
  return als.run({ ...DEFAULTS, ...config }, fn);
}

function getConfig() {
  return als.getStore() || { ...DEFAULTS };
}

function generateConfigId() {
  return crypto.randomBytes(6).toString('hex');
}

function saveConfig(config) {
  const id = generateConfigId();
  storedConfigs.set(id, config);
  return id;
}

function loadConfig(id) {
  return storedConfigs.get(id) || null;
}

module.exports = { runWithConfig, getConfig, saveConfig, loadConfig };
