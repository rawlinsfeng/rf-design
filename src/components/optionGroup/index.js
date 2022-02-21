import optionGroupStyle from 'inline!./src/components/optionGroup/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(optionGroupStyle).then(console.log);

export default class OptionGroup extends HTMLElement {

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <div class="group">${this.label}</div>
      <slot></slot>
    `;
  }

  get label() {
    return this.getAttribute('label');
  }

}

if (!customElements.get('rf-optgroup')) {
  customElements.define('rf-optgroup', OptionGroup);
}