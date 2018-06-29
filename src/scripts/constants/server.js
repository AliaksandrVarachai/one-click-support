/**
 * Backend API settings.
 * @type {{ORIGIN: string, PATH: string}}
 */
const API_SETTINGS = {
  ORIGIN: 'https://ecsb00100b6f.epam.com:480',
  PATH: '/api'
};

/**
 * Path to proxied by a server images.
 * @type {string}
 */
const IMAGE_PROXY_PATH = '/image-proxy';

/**
 * Settings for local test of the application.
 * @type {{NAME: string, PORT: number}}
 */
const LOCALHOST_SETTINGS = {
  NAME: 'localhost',
  PORT: 9091
};

module.exports = {
  API_SETTINGS,
  IMAGE_PROXY_PATH,
  LOCALHOST_SETTINGS,
};
