import inputGroupStyle from 'inline!./src/components/inputGroup/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(inputGroupStyle).then();

export default class InputGroup extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <slot></slot>
    `;
  }
}

if (!customElements.get('rf-input-group')) {
  customElements.define('rf-input-group', InputGroup);
}