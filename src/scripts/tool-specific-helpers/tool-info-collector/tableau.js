import restAPI from '../../rest-api';

// Is not used for report generation just for now
export function getClientInfo() {
  return {
    version: window.tableau ? window.tableau.Version.getCurrent().toString() : ''
  }
}

/**
 * Gets Tableau server information.
 * @returns {Promise<object|null>} - a js object formed from response body.
 * @throws {error} - status and description of the error.
 */
function getServerInfo() {
  if (process.env.NODE_IS_STARTED_LOCALLY)
    return Promise.resolve('Mocked Tableau Server Info');
  const xsrfTokenMatch = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;$]*)/i);
  if (!xsrfTokenMatch)
    throw Error('Authorization error: there is no X-XSRF-TOKEN cookie');
  const xsrfToken = xsrfTokenMatch[2];
  const options = {
    body: {
      method: 'getSessionInfo',
      params: {}
    },
    headers: {
      'X-XSRF-TOKEN': xsrfToken
    },
    credentials: 'same-origin',
  };
  return restAPI.post('/vizportal/api/web/v1/getSessionInfo', options).then(json => {
    if (!json || !json.result)
      return {version: 'Not defined'};
    const version = json.result.server.version.externalVersion;
    return {
      version: `Tableau Server Version: ${version.major}.${version.minor}.${version.patch}`
    }
  });
}


export default {
  getClientInfo,
  getServerInfo
}
