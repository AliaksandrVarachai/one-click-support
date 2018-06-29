/**
 * Id of DOM element containing one click support form.
 * @type {string}
 */
export const OCS_ROOT_ID = 'one-click-support-root';

/**
 * Pairs of listened events and relevant DOM attributes.
 * @type {{string: string}}
 */
export const OCS_EVENTS = {
  'click': 'ocs-onclick',
};

/**
 * Prefix for DOM attributes.
 * @type {string}
 */
export const PREFIX = 'ocs';

/**
 * File name of generated screenshot.
 * @type {string}
 */
export const SCREENSHOT_NAME = 'automatically-generated-screenshot.png';

export const NOTIFICATION_TYPES = {
  empty: 0,
  error: 1,
};
