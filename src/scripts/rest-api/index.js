import { HOSTNAME, LOCAL_HOSTNAME, PORT, LOCAL_PORT } from '../constants/server';

const API_ORIGIN = process.env.NODE_IS_STARTED_LOCALLY
  ? `https://${LOCAL_HOSTNAME}:${LOCAL_PORT}`
  : `https://${HOSTNAME}:${PORT}`;

/**
 * Processes a response and provides data from its body.
 * @param {object} response - a response object.
 * @returns {object|null} - a js object formed from response body.
 * @throws {error} - status and description of the error.
 */
function getJsonFromResponse(response) {
  if (response.ok)
    return response ? response.json() : null;
  throw new Error(`Error ${response.status}: ${response.statusText}`);
}

/**
 * Sends a get request to the server.
 * @param {string} api - api url.
 * @returns {Promise<object|null>}
 * @throws {error} - status end description of an error.
 */
function get(api) {
  const options = {
    headers: new Headers({'Accept': 'application/json'})
  };
  return fetch(`${API_ORIGIN}${api}`, options)
    .then(response => getJsonFromResponse(response));
}

/**
 * Sends a post request to the server.
 * @param {string} api - api url.
 * @param {FormData} formData - instance of FormData to be sent in the body of a request.
 * @returns {Promise<object|null>} - a js object formed from response body.
 * @throws {error} - status and description of the error.
 */
function post(api, formData) {
  const options = {
    headers: new Headers({
      'Accept': 'application/json',
    }),
    method: 'POST',
    body: formData
  };
  return fetch(`${API_ORIGIN}${api}`, options)
    .then(response => getJsonFromResponse(response));
}

/**
 * Gets a backend version (its aim is a validation).
 * @returns {Promise<string|null>} - version of backend.
 * @throws {error} - status and description of the error.
 */
function getVersion() {
  return get('/api/version');
}

/**
 *
 * @param {string} title - bug report title.
 * @param {string} priority - bug report priority.
 * @param {string} description - bug report description.
 * @param {string} screenshot - Base 64 string that encodes a created screenshot.
 * @param {object} files - fileList container in shape of {fileName1: Blob1, fileName2: Blob2, ...}.
 * @returns {Promise<object|null>} - response from server or null if there is not any data in response body.
 * @throws {error} - status and description of the error.
 */
function sendBugReport({ title, priority, description, screenshot = '', files = {}}) {
  const formData = new FormData();
  // TODO: add validation & create map for fields
  formData.append('title', title);
  formData.append('priority', priority);
  formData.append('description', description);
  formData.append('screenshot', screenshot);
  Object.keys(files).forEach(fileName => {
    formData.append('files[]', files[fileName].content, fileName);
  });
  return post('/api/bug-report', formData);
}

export default {
  getVersion,
  sendBugReport,
}
