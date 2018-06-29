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
    return Promise.resolve({version: 'Mocked Tableau Server Version Info'});
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
    apiPrefix: `${location.origin}/vizportal/api/web/v1`
  };
  return restAPI.post('/getSessionInfo', options).then(json => {
    const defaultSessionInfo = {
      reportPath: location.href,
      reporter: 'Not defined',
      version: 'Not defined'
    };
    if (!json || !json.result)
      return defaultSessionInfo;
    const version = json.result.server.version.externalVersion;
    return {
      ...defaultSessionInfo,
      reporter: json.result.user.displayName,
      version: `Tableau Server Version: ${version.major}.${version.minor}.${version.patch}`
    };
  });
}


export default {
  getClientInfo,
  getServerInfo
}
