import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { NOTIFICATION_TYPES } from '../../constants/client';

import './Notification.pcss';

export default class Notification extends React.PureComponent {
  static propTypes = {
    type: PropTypes.number.isRequired,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    onHide: PropTypes.func
  };

  getNotificationClass = (type) => {
    switch(type) {
      case NOTIFICATION_TYPES.error:
        return 'notification-error';
      default:
        return 'notification-empty';
    }
  }

  getMessageText = (message) => {
    if (Array.isArray(message)) {
      return message.map((msg, index) => (
        <div key={index}>{msg}</div>
      ));
    }

    return message;
  }

  render() {
    const { type, message, onHide } = this.props;
    const hasOnHide = typeof onHide === 'function';
    return (
      <div styleName={classnames('notification', this.getNotificationClass(type), {'has-on-hide': hasOnHide})}>
        {hasOnHide ? (
          <span className="material-icons" styleName='hide-notification' onClick={onHide}>close</span>
        ) : null}
        {this.getMessageText(message)}
      </div>
    );
  }
}
