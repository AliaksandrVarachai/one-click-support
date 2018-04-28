import React from 'react';
import PropTypes from 'prop-types';
import { OCS_NAMESPACE } from '../../constants/constants';

import './Tabs.pcss';

const uuidv5 = require('uuid/v5');

const PREFIX = 'ocs-tabs',
      LABEL_RESERVED_PREFIX = 'Tab Label';

/**
 * Transforms string to UUID useful for class name format.
 * @param str {string} - origin string.
 * @returns {string} - generated UUID.
 */
function getUuid(str) {
  return uuidv5(str, OCS_NAMESPACE);
}

export default class Tabs extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    labels: PropTypes.arrayOf((array, inx) => {
      const label = array[inx];
      if (inx !== array.indexOf(label) || label.substr(0, LABEL_RESERVED_PREFIX.length) === LABEL_RESERVED_PREFIX) {
        throw Error(`Labels must be an array of unique string and must not start with "${LABEL_RESERVED_PREFIX}"`);
      }
    }).isRequired,
    children: PropTypes.arrayOf(PropTypes.element).isRequired
  };

  render() {
    const { children, labels } = this.props;
    return (
      <div styleName="tabs">
        {React.Children.map(children, (child, inx) => {
          const label = labels && labels[inx] ? labels[inx] : `${LABEL_RESERVED_PREFIX} ${inx}`;
          const labelUuid = getUuid(label);
          return (
            <div styleName="tab">
              <input type="radio"
                     id={labelUuid}
                     name={`${PREFIX}-radio`}
                     styleName="radio"
                     defaultChecked={inx === 0}/>
              <label htmlFor={labelUuid}
                     styleName="label">
                {label}
              </label>
              <div styleName="content">
                {child}
              </div>
            </div>
          );
        })}
      </div>
    )
  }
}
