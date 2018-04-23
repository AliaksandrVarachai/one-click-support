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
          <div>
            <label htmlFor={`${PREFIX}-title`}>Title</label>
            <input type="text" id={`${PREFIX}-title`} defaultValue="Bug report"/>
          </div>
          <div>
            <label htmlFor={`${PREFIX}-to`}>Title</label>
            <input type="text" id={`${PREFIX}-to`} defaultValue=""/>
          </div>
          <div>
            <label htmlFor={`${PREFIX}-cc`}>CC</label>
            <input type="text" id={`${PREFIX}-cc`} defaultValue=""/>
          </div>
          <div>
            <label htmlFor={`${PREFIX}-priority`}>Priority</label>
            <select id={`${PREFIX}-priority`}>
              <option value="blocker">Blocker</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${PREFIX}-description`}>Description</label>
            <textarea id={`${PREFIX}-description`} placeholder="Please provide descriptions here"/>
          </div>
          <button>
            Add default screenshot
          </button>
          <button>
            Add attachment
          </button>
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
