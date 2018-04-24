import React from 'react';
import ReactDOM from 'react-dom';
import ReactEventOutside from 'react-event-outside';
import classnames from 'classnames';
import { OCS_ROOT_ID, OCS_EVENTS } from './constants/constants';
import addOcsButtonToDocument from './tool-specific-helpers/dom-initializer';

import './index.pcss';

const PREFIX = 'ocs',
      HIDDEN = 'hidden',
      VISIBLE = 'normal',
      MINIMIZED = 'minimized';


class Popup extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visibility: HIDDEN
    }
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
          this.setState({
            visibility: VISIBLE
          });
          break;
        default:
          console.log(`There is no event handler for "${eventOutsideName}"`);
      }
    });
  };

  closeHandler = (e) => {
    this.setState({
      visibility: HIDDEN
    });
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

  defaultScreenshotHandler = (e) => {
    console.log('defaultScreenshotHandler is called');
  };


  render() {
    const { visibility } = this.state;
    return (
      <div styleName={classnames('popup', {
        'popup-hidden': visibility === HIDDEN,
        'popup-minimized': visibility === MINIMIZED
      })}>
        <div styleName="header">
          <div className="material-icons" styleName="action action-close" onClick={this.closeHandler}>close</div>
          <div className="material-icons" styleName="action action-minimize" onClick={this.minimizeHandler}>border_bottom</div>
          <div className="material-icons" styleName="action action-show" onClick={this.showHandler}>border_outer</div>
          <span styleName="header-title">One click support</span>
        </div>

        <div styleName={classnames('content', {'display-none': visibility !== VISIBLE})}>
          <div styleName="table">
            <div styleName="table-row">
              <div styleName="cell">
                <label htmlFor={`${PREFIX}-title`} styleName="label-title">Title</label>
              </div>
              <div styleName="cell">
                <input type="text" id={`${PREFIX}-title`} styleName="input-title" defaultValue="Bug report"/>
              </div>
            </div>
            <div styleName="table-row">
              <div styleName="cell">
                <label htmlFor={`${PREFIX}-to`} styleName="label-to">To</label>
              </div>
              <div styleName="cell">
                <input type="text" id={`${PREFIX}-to`} styleName="input-to" defaultValue=""/>
              </div>
            </div>
            <div styleName="table-row">
              <div styleName="cell">
                <label htmlFor={`${PREFIX}-cc`} styleName="label-cc">CC</label>
              </div>
              <div styleName="cell">
                <input type="text" id={`${PREFIX}-cc`} styleName="input-cc" defaultValue=""/>
              </div>
            </div>
            <div styleName="table-row">
              <div styleName="cell">
                <label htmlFor={`${PREFIX}-priority`} styleName="label-priority">Priority</label>
              </div>
              <div styleName="cell">
                <select id={`${PREFIX}-priority`} styleName="input-priority" styleName="">
                  <option value="blocker">Blocker</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            </div>
          </div>
          <div styleName="row">
            <label htmlFor={`${PREFIX}-description`} styleName="label-description">Description</label>
            <textarea id={`${PREFIX}-description`} styleName="input-description" placeholder="Please provide descriptions here"/>
          </div>
          <div styleName="row">
            <label htmlFor={`${PREFIX}-to`} styleName="label-default-screenshot">
              Add default screenshot
            </label>
            <input id={`${PREFIX}-to`} type="checkbox" styleName="input-default-screenshot" defaultChecked/>
          </div>
          <div styleName="row">
            <label htmlFor={`${PREFIX}-attachment`} styleName="label-attachment">Attachment</label>
            <input type="file" id={`${PREFIX}-attachment`} styleName="input-attachment" multiple/>
          </div>
        </div>
      </div>
    );
  }
}

addOcsButtonToDocument();
const ocsRoot = document.createElement('div');
ocsRoot.id = OCS_ROOT_ID;
document.body.appendChild(ocsRoot);
const InitializedPopup = ReactEventOutside(Object.keys(OCS_EVENTS))(Popup);

ReactDOM.render(<InitializedPopup/>, ocsRoot);
