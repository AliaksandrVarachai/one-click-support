import { HOSTNAME, LOCAL_HOSTNAME, PORT, LOCAL_PORT } from '../constants/server';

const API_ORIGIN = process.env.NODE_IS_STARTED_LOCALLY
  ? `https://${LOCAL_HOSTNAME}:${LOCAL_PORT}`
  : PORT === 80
    ? `https://${HOSTNAME}`
    : `https://${HOSTNAME}:${PORT}`;

/**
 * Processes a response and provides data from its body.
 * @param {object} response - a response object.
 * @returns {object|null} - a js object formed from response body.
 */
function getJsonFromResponse(response) {
  return response.ok ? response.json() : null;
}

/**
 * Sends a get request to the server.
 * @param {string} api - api url.
 * @returns {Promise<object|null>}
 * @throws {error} - status and description of an error.
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
function postFormData(api, formData) {
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
 * Sends a post request to the server.
 * @param {string} api - api url.
 * @param {object} body - object to be sent in the body of a request.
 * @param {object} [headers={}] - object of request headers.
 * @param {string} [credentials='same-origin'] - object to be sent in the body of a request.
 * @returns {Promise<object|null>} - a js object formed from response body.
 * @throws {error} - status and description of the error.
 */
function post(api, {body, headers = {}, credentials = 'omit'}) {
  const _options = {
    headers: new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers
    }),
    method: 'POST',
    body: JSON.stringify(body),
    credentials,
  };
  return fetch(`${API_ORIGIN}${api}`, _options)
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
 * Gets a bug report (the aim is its validation).
 * @returns {Promise<string|null>} - report object.
 * @throws {error} - status and description of the error.
 */
function getBugReport() {
  return get('/api/read-report');
}

/**
 * Sends a formed bug report.
 * @param {object} fields - an object which contains string or json-like fields.
 * @param {object} files - fileList container in shape of {fileName1: Blob1, fileName2: Blob2, ...}.
 * @returns {Promise<object|null>} - response from server or null if there is not any data in response body.
 * @throws {error} - status and description of the error.
 */
// function sendBugReport(fields, files = {}) {
//   const formData = new FormData();
//   formData.append('fields', JSON.stringify(fields));
//   Object.keys(files).forEach(fileName => {
//     formData.append('files[]', files[fileName].content, fileName);
//   });
//   if (process.env.NODE_IS_STARTED_LOCALLY)
//     return postFormData('/api/create-report', formData);
//
//   // TODO: replace a mocked response with a real one
//   console.log('reportFields=', fields);
//   console.log('reportFiles=', Object.keys(files).reduce((acc, fileName) => {
//     acc[fileName] = files[fileName].preview;
//     return acc;
//   }, {}));
//   return Promise.resolve({isSuccess: true});
// }

function sendBugReportFields(fields) {
  if (process.env.NODE_IS_STARTED_LOCALLY)
    return post('/api/create-report-fields', {body: fields});
  // TODO: replace a mocked response with a real one
  console.log('reportFields=', fields);
  return Promise.resolve({isSuccess: true});
}

function sendBugReportFiles(files) {
  const formData = new FormData();
  Object.keys(files).forEach(fileName => {
    formData.append('files[]', files[fileName].content, fileName);
  });
  if (process.env.NODE_IS_STARTED_LOCALLY)
    return postFormData('/api/create-report-files', formData);
  // TODO: replace a mocked response with a real one
  console.log('reportFiles=', Object.keys(files).reduce((acc, fileName) => {
    acc[fileName] = files[fileName].preview;
    return acc;
  }, {}));
  return Promise.resolve({isSuccess: true});
}


export default {
  get,
  post,
  getVersion,
  getBugReport,
  // sendBugReport,
  sendBugReportFields,
  sendBugReportFiles,
}
