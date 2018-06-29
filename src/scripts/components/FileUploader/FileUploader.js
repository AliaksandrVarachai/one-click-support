import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { PREFIX, SCREENSHOT_NAME } from '../../constants/client';

import './FileUploader.pcss';

export default class FileUploader extends React.PureComponent {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
  }

  static propTypes = {
    extensions: PropTypes.arrayOf(PropTypes.string),
    maxItems: PropTypes.number,
    multiple: PropTypes.bool,
    storedFiles: PropTypes.object.isRequired,
    isScreenshot: PropTypes.bool.isRequired,
    onScreenshotUpload: PropTypes.func.isRequired,
    onScreenshotRemove: PropTypes.func.isRequired,
    onScreenshotPreview: PropTypes.func.isRequired,
    onFileUpload: PropTypes.func.isRequired,
    onFileRemove: PropTypes.func.isRequired,
    onFilePreview: PropTypes.func.isRequired,
  };

  static defaultProps = {
    extensions: ['png', 'jpeg', 'jpg', 'gif', 'bmp'],
    maxItems: 5,
    multiple: true
  };

  validateFile = (file) => {
    const { extensions } = this.props;
    const fileExtArray = /\.([^.]+)$/.exec(file.name);
    const fileExt = fileExtArray ? fileExtArray[1].toLowerCase() : '';
    if (!fileExt || extensions.indexOf(fileExt) < 0) {
      alert(`Please, upload the file with correct format (${extensions.join(', ')})`);
      return false;
    }
    if (file.name.toLowerCase() === SCREENSHOT_NAME.toLowerCase()) {
      alert(`File name "${SCREENSHOT_NAME}" is not allowed for attachments`);
      return false;
    }
    return true;
  };

  checkItemLimit = (count) => {
    const { maxItems, storedFiles } = this.props;
    const itemsCount = Object.keys(storedFiles).length + count;
    if (maxItems && itemsCount > maxItems) {
      alert(`Maximum number of files is ${maxItems}`);
      return false;
    }
    return true;
  };

  uploadFile = (file) => {
    const { onFileUpload } = this.props;
    const fileToStore = {
      content: file,
      preview: ''
    };
    const reader = new FileReader();

    reader.onload = (e) => {
      fileToStore.preview = e.target.result;
      const fileName = file.name;
      onFileUpload({ [fileName]: fileToStore });
    };
    reader.readAsDataURL(file);
  };

  onInputChange = (event) => {
    if (event && event.target.files.length) {
      const files = [ ...event.target.files ];
      if (this.checkItemLimit(files.length) && files.every(this.validateFile)) {
        files.forEach(this.uploadFile);
      }
      this.fileInputRef.current.value = '';
    }
  };

  render() {
    const {
      extensions,
      maxItems,
      multiple,
      storedFiles,
      isScreenshot,
      onScreenshotUpload,
      onScreenshotRemove,
      onScreenshotPreview,
      onFileRemove,
      onFilePreview
    } = this.props;

    return (
      <div>
        <div>
          <div styleName={classnames('attachment-item', {'display-none': !isScreenshot})}>
            <span styleName="link"
                  onClick={onScreenshotPreview}>
              Automatically generated screenshot
            </span>
            <span className="material-icons"
                  styleName="attachment-remove"
                  onClick={onScreenshotRemove}>
              delete
            </span>
          </div>
          {Object.keys(storedFiles).reduce((accum, fileName, fileInx) => {
            accum.push(
              <div key={fileName}
                   styleName="attachment-item">
                <span styleName="link"
                      onClick={onFilePreview(fileInx)}>
                  {fileName}
                </span>
                <span className="material-icons"
                      styleName="attachment-remove"
                      onClick={onFileRemove(fileName)}>
                  delete
                </span>
              </div>
            );
            return accum;
          }, [])}
        </div>
        <div>
          <input type="file"
                 ref={this.fileInputRef}
                 id={`${PREFIX}-attachment`}
                 styleName="input-attachment"
                 multiple={multiple}
                 accept={extensions}
                 onChange={this.onInputChange}
          />
          <label htmlFor={`${PREFIX}-attachment`}
                 className="material-icons"
                 styleName={classnames('attach-button', {'display-none': Object.keys(storedFiles).length >= maxItems})}>
            add
          </label>
          <span className="material-icons"
                styleName={classnames('attach-button', {'display-none': isScreenshot})}
                onClick={onScreenshotUpload}>
            add_to_queue
          </span>
        </div>
      </div>
    )
  }
}
