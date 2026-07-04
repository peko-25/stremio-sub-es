let currentConfig = { mode: 'auto', primary: 'any', lang: 'spa' };

function setConfig(config) {
  currentConfig = config;
}

function getConfig() {
  return currentConfig;
}

module.exports = { setConfig, getConfig };
