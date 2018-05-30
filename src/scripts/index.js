import React from 'react';
import ReactDOM from 'react-dom';
import ReactEventOutside from 'react-event-outside';
import classnames from 'classnames';
import html2canvas from 'html2canvas';
import { IMAGE_PROXY_PATH } from './constants/server';
import { OCS_ROOT_ID, OCS_EVENTS, PREFIX, NOTIFICATION_TYPES } from './constants/client';
import FileUploader from './components/FileUploader/FileUploader';
import restApi from './rest-api';
import Notification from './components/Notification/Notification';
import domInitializer from './tool-specific-helpers/dom-initializer';
import screenshotDOMPreprocess from './tool-specific-helpers/screenshot-dom-preprocessor';
import { getBrowserInfo, getConsoleInfo, getUncaughtErrorsInfo } from './helpers/browser-info-collectors';
import toolInfoCollector from './tool-specific-helpers/tool-info-collector';
import { validateFormFields } from './helpers/validators';

import './index.pcss';

const HIDDEN = 'hidden',
      VISIBLE = 'normal',
      MINIMIZED = 'minimized';


class Popup extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visibility: HIDDEN,
      tab: 'main',
      isScreenshot: true,
      storedFiles: {}, // has a shape: {fileName: {content: Blob, preview: Base64String}, ...}
      validationErrors: {
        type: NOTIFICATION_TYPES.empty,
        message: [],
      },
      formFields: {
        title: '',
        priority: 'minor',
        description: '',
      }
    };
    this.image = React.createRef();
  }

  handleEvent = (event) => {
    Object.keys(OCS_EVENTS).forEach(ocsEvent => {
      if (event.type !== ocsEvent)
        return;
      const eventOutsideName = event.target.getAttribute(OCS_EVENTS[ocsEvent]);
      if (!eventOutsideName)
        return;
      switch(eventOutsideName) {
        case 'showMainPopup':
          domInitializer.disableOcsButton(true);
          this.takeScreenshot().then(canvas => {
            this.setState({
              visibility: VISIBLE
            });
            this.image.current.src = canvas.toDataURL('image/png', 1);
          });
          break;
        default:
          console.log(`There is no event handler for "${eventOutsideName}"`);
      }
    });
  };

  closeHandler = (e) => {
    if (confirm('Are you sure to close the window?')) {
      domInitializer.disableOcsButton(false);
      this.setState({
        visibility: HIDDEN
      });
    }
  };

  minimizeHandler = (e) => {
    this.setState({
      visibility: MINIMIZED
    });
  };

  showHandler = (e) => {
    this.setState({
      visibility: VISIBLE
    });
  };

  sendHandler = (e) => {
    const { storedFiles, isScreenshot, formFields } = this.state;
    if( !this.validateForm() ) {
      return;
    }
    toolInfoCollector.getServerInfo()
      .then(serverInfo => {
        const reportFields = {
          title: formFields.title,
          priority: formFields.priority,
          description: formFields.description,
          browser: getBrowserInfo(),
          console: getConsoleInfo(),
          uncaughtErrors: getUncaughtErrorsInfo(),
          serverInfo,
        };
        if (isScreenshot)
          reportFields.screenshot = this.image.current.src;
        return Promise.all([
          restApi.sendBugReportFields(reportFields),
          restApi.sendBugReportFiles(storedFiles),
        ]);
        // return restApi.sendBugReport(reportFields, storedFiles);
      })
      .then(([responseFields, responseFiles]) => {
        console.log('Response from a server:');
        console.log('responseFields', responseFields);
        console.log('responseFiles', responseFiles);
        this.setState({
          visibility: HIDDEN
        });
        domInitializer.disableOcsButton(false);
        alert('Message is sent');
      })
      .catch(message => {
        console.log(message);
      });
  };

  changeTabHandler = (tab) => (e) => {
    this.setState({
      tab
    });
  };

  takeScreenshot = (e) => {
    const revertDOMChanges = screenshotDOMPreprocess();
    return html2canvas(document.body, {
      async: true,  // If there are unwilling side effects related to the direct DOM manipulations, try {async: false}
      proxy: `${location.protocol}//${location.host}/${IMAGE_PROXY_PATH}`,
      backgroundColor: null,
      useCORS: true,
      logging: process.env.NODE_ENV !== 'production',
    }).then(canvas => {
      revertDOMChanges();
      return canvas;
    });
  };

  fileUploadHandler = (file) => {
    const { storedFiles } = this.state;
    this.setState({
      storedFiles: {
        ...storedFiles,
        ...file
      }
    });
  };

  fileRemoveHandler = (fileName) => (e) => {
    const { [fileName]: fileToRemove, ...filesToStore } = this.state.storedFiles;
    this.setState({
      storedFiles: filesToStore
    });
  };

  filePreviewHandler = (fileInx) => (e) => {
    this.setState({
      tab: `attachment-${fileInx}`
    });
  };

  screenshotUploadHandler = (e) => {
    this.setState({
      isScreenshot: true
    });
  };

  screenshotRemoveHandler = (e) => {
    this.setState({
      isScreenshot: false
    });
  };

  screenshotPreviewHandler = (e) => {
    this.setState({
      tab: 'screenshot-preview'
    });
  };

  inputChangeHandler = (e, field) => {
    e.preventDefault();
    const { formFields, validationErrors } = this.state;
    this.setState({
      formFields: {
        ...formFields,
        [field]: e.target.value,
      }
    });

    if (validationErrors.type !== NOTIFICATION_TYPES.empty) {
      this.validateForm();
    }
  }

  clearValidationErrors = () => {
    this.setState({
      validationErrors: {
        type: NOTIFICATION_TYPES.empty,
        message: '',
      },
    });
  }

  validateForm = () => {
    const validation = validateFormFields(this.state.formFields);
    if (validation.valid !== true) {
      this.setState({
        validationErrors: {
          type: NOTIFICATION_TYPES.error,
          message: validation.message,
        }
      });
      return false;
    }

    this.clearValidationErrors();
    return true;
  }

  render() {
    const { visibility, tab, isScreenshot, storedFiles, formFields, validationErrors } = this.state;
    return (
      <div styleName={classnames('popup', {
        'popup-hidden': visibility === HIDDEN,
        'popup-minimized': visibility === MINIMIZED
      })}>
        <div styleName="header">
          <div className="material-icons" styleName="action action-close" onClick={this.closeHandler}>close</div>
          <div className="material-icons" styleName="action action-minimize" onClick={this.minimizeHandler}>border_bottom</div>
          <div className="material-icons" styleName="action action-show" onClick={this.showHandler}>border_outer</div>
          <span styleName="header-title">OneClick Support</span>
        </div>

        <div styleName={classnames('content', {'display-none': visibility !== VISIBLE})}>
          <div styleName="tabs">

            {/* main tab */}
            <div styleName={classnames('tab', {'display-none': tab !== 'main'})}>
              <div styleName="tab-content">
                <div styleName="table">
                  <div styleName="table-row">
                    <div styleName="cell">
                      <label htmlFor={`${PREFIX}-title`} styleName="label-title">Title</label>
                    </div>
                    <div styleName="cell">
                      <input
                        type="text"
                        id={`${PREFIX}-title`}
                        styleName="input-title"
                        value={formFields.title}
                        onChange={(e) => this.inputChangeHandler(e, 'title')}
                      />
                    </div>
                  </div>
                  <div styleName="table-row">
                    <div styleName="cell">
                      <label htmlFor={`${PREFIX}-priority`} styleName="label-priority">Priority</label>
                    </div>
                    <div styleName="cell">
                      <select
                        id={`${PREFIX}-priority`}
                        styleName="input-priority"
                        value={formFields.priority}
                        onChange={(e) => this.inputChangeHandler(e, 'priority')}
                      >
                        <option value="blocker">Blocker</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div styleName="row flex-height">
                  <label htmlFor={`${PREFIX}-description`} styleName="label-description">Description</label>
                  <div styleName="input-description-wrapper">
                    <textarea id={`${PREFIX}-description`}
                              styleName="input-description"
                              placeholder="Please provide the description here"
                              value={formFields.description}
                              onChange={(e) => this.inputChangeHandler(e, 'description')}
                    />
                  </div>
                </div>
                <div styleName="row ">
                  <FileUploader storedFiles={storedFiles}
                                isScreenshot={isScreenshot}
                                onScreenshotUpload={this.screenshotUploadHandler}
                                onScreenshotRemove={this.screenshotRemoveHandler}
                                onScreenshotPreview={this.screenshotPreviewHandler}
                                onFileUpload={this.fileUploadHandler}
                                onFileRemove={this.fileRemoveHandler}
                                onFilePreview={this.filePreviewHandler}
                  />
                </div>
              </div>
            </div>

            {/* screenshot-preview tab */}
            <div styleName={classnames('tab', {'display-none': tab !== 'screenshot-preview'})}>
              <div styleName="tab-content">
                <img ref={this.image} src="//:0" alt="no image" styleName="screenshot"/>
              </div>
            </div>

            {/* attachment preview tabs */}
            {Object.keys(this.state.storedFiles).map((fileName, inx) => (
              <div styleName={classnames('tab', {'display-none': tab !== `attachment-${inx}`})}
                   key={fileName}>
                <div styleName="tab-content">
                  <img src={this.state.storedFiles[fileName].preview} alt="no preview" styleName="screenshot"/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div styleName="footer">
          <button styleName={classnames('button', {'display-none': tab !== 'main'})}
                  onClick={this.closeHandler}>
            <i className="material-icons">block</i>
            Cancel
          </button>
          <button styleName={classnames('button', {'display-none': tab !== 'main'})}
                  onClick={this.sendHandler}>
            <i className="material-icons">check</i>
            Send
          </button>
          <button styleName={classnames('button', {'display-none': tab === 'main'})}
                  onClick={this.changeTabHandler('main')}>
            <i className="material-icons">arrow_back</i>
            Back to form
          </button>
          <Notification {...validationErrors} onHide={this.clearValidationErrors} />
        </div>
      </div>
    );
  }
}

domInitializer.addOcsButtonAsync()
  .then(btn => {
    const ocsRoot = document.createElement('div');
    ocsRoot.id = OCS_ROOT_ID;
    document.body.appendChild(ocsRoot);
    const InitializedPopup = ReactEventOutside(Object.keys(OCS_EVENTS))(Popup);
    ReactDOM.render(<InitializedPopup/>, ocsRoot);
  })
  .catch(msg => {
    console.log(msg);
  });
