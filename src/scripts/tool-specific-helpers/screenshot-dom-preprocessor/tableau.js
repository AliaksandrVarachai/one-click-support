function noop() {}

/**
 * Fixes special cases when a screenshot plugin does not process properly.
 * Details: the screenshot does not contain some specific elements because of their wrong interpreted CSS props.
 * Fix: replace wrong interpreted CSS props before taking of the screenshot and revert changes after it.
 * Note: the fix implements the direct DOM manipulations, so if there are unwilling side effects
 * try to configure the plugin to synchronous parsing.
 * @returns {Function} - reverts all made changes.
 */
export default function process() {
  const revertHandler = {};

  // Elements are not shown in the '#tabViewer' node because of its props {visibility: hidden}
  revertHandler.tabViewer = (function() {
    const node = frames[0] && frames[0].document.getElementById('tabViewer');
    if (!node)
      return noop;
    const oldVisibility = node.style.visibility;
    const newVisibility = 'visible';
    node.style.visibility = newVisibility;

    return function() {
      if (node.style.visibility === newVisibility)
        node.style.visibility = oldVisibility;
    }
  })();

  // Absolute positioned elements are not shown inside of the '.QuantitativeFilterBox' node because of its small height and props {overflow: hidden}
  revertHandler.quantitativeFilterBox = (function() {
    const nodes = frames[0] && frames[0].document.getElementsByClassName('QuantitativeFilterBox');
    if (!nodes || !nodes.length)
      return noop;

    const oldOverflows = [];
    const newOverflow = 'visible';
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      oldOverflows.push(node.style.overflow);
      node.style.overflow = newOverflow;
    }

    return function() {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.style.overflow === newOverflow)
          node.style.overflow = oldOverflows[i]
      }
    }
  })();


  return function revert() {
    Object.keys(revertHandler).forEach(revertName => revertHandler[revertName]());
  }
}
