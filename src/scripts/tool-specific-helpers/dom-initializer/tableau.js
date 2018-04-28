export default function addOcsButtonToDocument() {
  const btn = document.createElement('button');
  btn.innerHTML = 'One Click Support';
  btn.setAttribute('role', 'button');
  btn.setAttribute('ocs-onclick', 'showMainPopup');
  btn.setAttribute('style', 'position: absolute; top: 12px; right: 350px; width: 140px; padding: 5px;');
  document.body.appendChild(btn);
  return btn;
}
