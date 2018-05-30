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
    console.log('fields=', fields);
    console.log('files=', files);
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
            fieldName === 'screenshot'
              ?
              <tr key={`field_${fieldName}`}>
                <td>{fieldName}</td>
                <td>
                  <img src={JSON.parse(fields.screenshot)} styleName="image" alt="no screenshot"/>
                </td>
              </tr>
              :
              <tr key={`field_${fieldName}`}>
                <td>{fieldName}</td>
                <td>
                  <pre>
                    {JSON.stringify(JSON.parse(fields[fieldName]), null, '  ')}
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

restAPI.getBugReport()
  .then(report => {
    if (!report) {
      ReactDOM.render(<BugReport fields={{'no fields': 'no values'}} files={[]} />, document.getElementById('root'));
      return;
    }
    ReactDOM.render(<BugReport fields={report.fields} files={report.files} />, document.getElementById('root'));
  });
