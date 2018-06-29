import { API_SETTINGS, LOCALHOST_SETTINGS } from '../constants/server';

const API_PREFIX = process.env.NODE_IS_STARTED_LOCALLY
  ? `https://${LOCALHOST_SETTINGS.NAME}:${LOCALHOST_SETTINGS.PORT}${API_SETTINGS.PATH}`
  : `${API_SETTINGS.ORIGIN}${API_SETTINGS.PATH}`;


/**
 * Constructor for custom error object overriding message field with custom data.
 * @param {Response} response - XMLHttpRequest object that contains data about happened error.
 * @constructor
 */
function ResponseError(response) {
  this.message = `${response.status}: ${response.statusText}`;
}

ResponseError.prototype = Object.create(Error.prototype);


/**
 * Processes a response and provides data from its body.
 * @param {object} response - a response object.
 * @returns {object} - a js object formed from response body.
 * @throws {error} - status and description of an error.
 */
function getJsonFromResponse(response) {
  if (response.ok) {
    return response.json();
  }
  throw new ResponseError(response);
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
  return fetch(`${API_PREFIX}${api}`, options)
    .then(response => getJsonFromResponse(response));
}

/**
 * Sends a post request to the server. Provides a callback for tracking the upload process.
 * @param {string} api - api url.
 * @param {FormData} formData - instance of FormData to be sent in the body of a request.
 * @param {function} onProgressCallback - callback for upload progress.
 * @returns {Promise<null>} - response body is empty.
 * @throws {error} - status and description of the error.
 */
function postFormData(api, formData, onProgressCallback) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_PREFIX}${api}`);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.upload.onprogress = onProgressCallback;

    xhr.onreadystatechange = function(event) {
      if (xhr.readyState !== XMLHttpRequest.DONE)
        return;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(null); //xhr.response is empty
      } else {
        reject(xhr.status ? new ResponseError(xhr) : new Error('Error during uploading'));
      }
    };

    xhr.send(formData);
  });
}

/**
 * Sends a post request to the server.
 * @param {string} api - api url.
 * @param {object} body - object to be sent in the body of a request.
 * @param {object} [headers={}] - object of request headers.
 * @param {string} [credentials='same-origin'] - object to be sent in the body of a request.
 * @param {string} [apiPrefix] - prefixed API origin and pathname of the request.
 * @returns {Promise<object|null>} - a js object formed from response body.
 * @throws {error} - status and description of the error.
 */
function post(api, {body, headers = {}, credentials = 'same-origin', apiPrefix = API_PREFIX}) {
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
  return fetch(`${apiPrefix}${api}`, _options)
    .then(response => getJsonFromResponse(response));
}

/**
 * Gets a backend OneClick Support form's settings.
 * @returns {Promise<string|null>} - version of backend.
 * @throws {error} - status and description of the error.
 */
function getSettings() {
  return get('/priorities');
}


/**
 * Gets a bug report (the aim is its validation).
 * @returns {Promise<string|null>} - report object.
 * @throws {error} - status and description of the error.
 */
function getBugReport() {
  return get('/read-report');
}

/**
 * Sends a formed bug report.
 * @param {object} fields - an object which contains string or json-like fields.
 * @param {object} files - fileList container in shape of {fileName1: Blob1, fileName2: Blob2, ...}.
 * @param {function} [onProgressCallback] - callback for upload progress.
 * @returns {Promise<object|null>} - response from server or null if there is not any data in response body.
 * @throws {error} - status and description of the error.
 */
function sendBugReport(fields, files = {}, onProgressCallback = () => {}) {
  const formData = new FormData();
  formData.append('fields', JSON.stringify(fields));
  Object.keys(files).forEach(fileName => {
    formData.append('files', files[fileName].content, fileName);
  });
  // TODO: remove console.log in prod
  console.log('reportFields=', fields);
  console.log('reportFiles=', Object.keys(files).map(fileName => [fileName]));

  return postFormData('/issue', formData, onProgressCallback);
}


export default {
  get,
  post,
  getSettings,
  getBugReport,
  sendBugReport,
}
