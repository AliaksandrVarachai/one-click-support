const maxWaitingTime = 15000; //ms
let btn;
let boundedRightNode;
let wrapperNode;

function addOcsButtonAsync() {

  // Checks free space for the button to provide an adaptive design.
  function setAdaptiveButtonPosition() {
    const btnRight = boundedRightNode.getBoundingClientRect().left;
    const btnLeft = wrapperNode.getBoundingClientRect().left;
    if (btnRight - btnLeft < 60) {
      btn.style.left = 'auto';
      btn.style.right = '30px';
    } else {
      btn.style.left = btnRight - 40 + 'px';
      btn.style.right = 'auto';
    }
  }

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const intervalId = setInterval(() => {
      boundedRightNode = document.querySelector('[data-tb-test-id="alerts-menu"]');
      if (Date.now() > start + maxWaitingTime) {
        clearInterval(intervalId);
        reject('One click support: dashboard is not loaded');
        return;
      }
      if(!boundedRightNode)
        return;
      clearInterval(intervalId);
      wrapperNode = boundedRightNode.parentNode;

      btn = document.createElement('button');
      btn.classList.add('ocs__start-button');
      btn.classList.add('material-icons');
      btn.textContent = 'headset_mic';
      btn.setAttribute('role', 'button');
      btn.setAttribute('ocs-onclick', 'showMainPopup');
      btn.style.position = 'absolute';
      btn.style.top = '1px';
      btn.style.height = '50px';
      btn.style.color = '#fff';
      btn.style.opacity = '0.85';
      btn.style.background = 'transparent';
      btn.style.border = '0';
      btn.style.padding = '0';
      btn.style.fontSize = '20px';
      btn.style.lineHeight = btn.style.height;
      setAdaptiveButtonPosition();
      document.body.appendChild(btn);

      window.onresize = setAdaptiveButtonPosition;

      resolve(btn);
    }, 200);
  });
}

function disableOcsButton(isDisabled) {
  btn.disabled = isDisabled;
}

export default {
  addOcsButtonAsync,
  disableOcsButton
}
