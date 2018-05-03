import React from 'react';
import ReactDOM from 'react-dom';
import ReactEventOutside from 'react-event-outside';
import classnames from 'classnames';
import html2canvas from 'html2canvas';
import { IMAGE_PROXY_PATH } from './constants/server';
import { OCS_ROOT_ID, OCS_EVENTS, PREFIX } from './constants/client';
import domInitializer from './tool-specific-helpers/dom-initializer';
// import Tabs from './components/Tabs/Tabs';

import './index.pcss';

const HIDDEN = 'hidden',
      VISIBLE = 'normal',
      MINIMIZED = 'minimized';


class Popup extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visibility: HIDDEN,
      tab: 'main'
    };
    this.image = React.createRef();
  }

  handleEvent = (event) => {
    const { toggleBtnDisabled } = this.props;

    Object.keys(OCS_EVENTS).forEach(ocsEvent => {
      if (event.type !== ocsEvent)
        return;
      const eventOutsideName = event.target.getAttribute(OCS_EVENTS[ocsEvent]);
      if (!eventOutsideName)
        return;
      switch(eventOutsideName) {
        case 'showMainPopup':
          toggleBtnDisabled(true); // disable One Click Support button
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
    const { toggleBtnDisabled } = this.props;
    if (confirm('Are you sure to close the window?')) {
      toggleBtnDisabled(false); // enable One Click Support button
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
    const { toggleBtnDisabled } = this.props;
    toggleBtnDisabled(false); // enable One Click Support button
    alert('Message is sent');
    this.setState({
      visibility: HIDDEN
    });
  };

  changeTabHandler = (tab) => (e) => {
    console.log('****** tabLabel=', tab);
    this.setState({
      tab
    });
  };



  takeScreenshot = (e) => {
    // This direct DOM manipulation makes html2canvas take a screenshot of an invisible element,
    // because onclone option does not copy iframe content properly.
    // If there are unwilling side effects try {async: false} option.
    const invisibleNode = frames[0].document.getElementById('tabViewer');
    const originVisibility = invisibleNode.style.visibility;
    const modifiedVisibility = 'visible';
    invisibleNode.style.visibility = modifiedVisibility;
    return html2canvas(document.body, {
      async: true,
      // TODO: configure proxy for Apache on a server side
      proxy: `${location.protocol}//${location.host}/${IMAGE_PROXY_PATH}`,
      backgroundColor: null,
      useCORS: true,
      logging: process.env.NODE_ENV !== 'production',
    }).then(canvas => {
      if (invisibleNode.style.visibility === modifiedVisibility) {
        invisibleNode.style.visibility = originVisibility;
      }
      return canvas;
    });
  };

  render() {
    const { visibility, tab } = this.state;
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
            <div styleName={classnames('tab', {'display-none': tab !== 'main'})}>
              {/*<div styleName="tab-content">*/}
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
                      <label htmlFor={`${PREFIX}-priority`} styleName="label-priority">Priority</label>
                    </div>
                    <div styleName="cell">
                      <select id={`${PREFIX}-priority`} styleName="input-priority" defaultValue="minor">
                        <option value="blocker">Blocker</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div styleName="row flex-height">
                  <label htmlFor={`${PREFIX}-description`} styleName="label-description">Description</label>
                  <textarea id={`${PREFIX}-description`} styleName="input-description" placeholder="Please provide descriptions here"/>
                </div>
                <div styleName="row">
                  <label htmlFor={`${PREFIX}-to`} styleName="label-default-screenshot">
                    Add default screenshot
                  </label>
                  <input id={`${PREFIX}-to`} type="checkbox" styleName="input-default-screenshot" defaultChecked/>
                  <span styleName="link" onClick={this.changeTabHandler('screenshot-preview')}>Preview screenshot</span>
                </div>
                <div styleName="row">
                  <label htmlFor={`${PREFIX}-attachment`} styleName="label-attachment">Attachment</label>
                  <input type="file" id={`${PREFIX}-attachment`} styleName="input-attachment" multiple/>
                </div>
              {/*</div>*/}
            </div>
          </div>

          <div styleName={classnames('tab', {'display-none': tab !== 'screenshot-preview'})}>
            <img ref={this.image} src="about:blank" alt="no image" styleName="screenshot"/>
          </div>
        </div>

        <div styleName="footer">
          <button styleName="button" onClick={this.closeHandler}><i className="material-icons">block</i>Cancel</button>
          <button styleName="button" onClick={this.sendHandler}><i className="material-icons">check</i>Send</button>
        </div>
      </div>
    );
  }
}

const btn = domInitializer.addOcsButtonToDocument();
const ocsToggleDisabled = domInitializer.getOcsButtonToggleDisabled(btn);
const ocsRoot = document.createElement('div');
ocsRoot.id = OCS_ROOT_ID;
document.body.appendChild(ocsRoot);
const InitializedPopup = ReactEventOutside(Object.keys(OCS_EVENTS))(Popup);

ReactDOM.render(<InitializedPopup toggleBtnDisabled={ocsToggleDisabled}/>, ocsRoot);
