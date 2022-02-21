import buttonGroupStyle from 'inline!./src/components/buttonGroup/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(buttonGroupStyle).then(console.log);

export default class ButtonGroup extends HTMLElement {
  static get observedAttributes() { return ['disabled'] }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <slot></slot>
    `;
  }

  get disabled() {
    return this.getAttribute('disabled') !== null;
  }
  set disabled(value) {
    if(value===null || value===false){
      this.removeAttribute('disabled');
    }else{
      this.setAttribute('disabled', '');
    }
  }
}

if (!customElements.get('rf-button-group')) {
  customElements.define('rf-button-group', ButtonGroup);
}