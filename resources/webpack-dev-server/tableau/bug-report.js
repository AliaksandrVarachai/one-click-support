/**
 * Allows to see the content of previously sent bug report.
 * Copies html into output directory.
 * @example <caption>Local testing of the common components.</caption>
 * http://localhost:9091/bug-report.html
 */

import './bug-report.html';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import restAPI from '../../../src/scripts/rest-api';

import './bug-report.pcss';

class BugReport extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    fields: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired
  };

  render() {
    const { fields, files } = this.props;
    return (
      <div styleName="container">
        <div styleName="header">
          OneClick Support's data
        </div>
        <table styleName="content">
          <thead styleName="header">
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
          {Object.keys(fields).map(fieldName => (
            <tr key={`field_${fieldName}`}>
              <td>{fieldName}</td>
              <td>
                <pre>
                  {JSON.stringify(fields[fieldName], null, '  ')}
                </pre>
              </td>
            </tr>
          ))}
          {files.map((file, inx) => (
            <tr key={`file_${file.originalFilename}`}>
              <td>attachment #{inx + 1}</td>
              <td>
                <div styleName="image-header">{file.originalFilename}</div>
                <img src={file.src} styleName="image" alt="no attached image"/>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  }
}

const rootNode = document.getElementById('root');

restAPI.getBugReport()
  .then(report => {
    ReactDOM.render(<BugReport fields={JSON.parse(report.fields)} files={report.files} />, rootNode);
  }).catch(error => {
    ReactDOM.render(<h1 style={{color: 'red'}}>{error.message}</h1>, rootNode);
  });
