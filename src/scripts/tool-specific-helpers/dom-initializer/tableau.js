export default function addOcsButtonToDocument() {
  const btn = document.createElement('button');
  btn.innerHTML = 'One Click Support';
  btn.setAttribute('role', 'button');
  btn.setAttribute('ocs-onclick', 'showMainPopup');
  btn.setAttribute('style', 'padding: 5px;');
  document.querySelector('[data-tb-test-id="help-menu"]').parentNode.insertAdjacentElement('afterbegin', btn);
  return btn;
}
