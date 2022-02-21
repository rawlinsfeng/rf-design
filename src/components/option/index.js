import '../button/index.js';
import optionStyle from 'inline!./src/components/option/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(optionStyle).then(console.log);

export default class Option extends HTMLElement {
  static get observedAttributes() { return ["value", "selected", "disabled"]; }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <rf-button id="option" class="option" type="flat" ${this.disabled ? "disabled" : ""}><slot></slot></rf-button>
    `;
  }

  connectedCallback() {
    this.option = this.shadowRoot.getElementById('option');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'disabled' && this.option) {
      if (newValue != null) {
        this.option.disabled = newValue;
      }
    }
  }

  focus() {
    this.option.focus();
  }
  /**
   * @param {boolean} value
   */
   set selected(value) {
    if (value) {
      this.setAttribute('selected', '');
    } else {
      this.removeAttribute('selected');
    }
  }
  set focusin(value) {
    if (value) {
      this.setAttribute('focusin', '');
      this.option.setAttribute('focus', '');
      this.scrollIntoView({
        block: "nearest"
      });
    } else {
      this.removeAttribute('focusin');
      this.option.removeAttribute('focus');
    }
  }

  get value() {
    return this.getAttribute('value');
  }

  get disabled() {
    return this.getAttribute('disabled') !== null;
  }
  set disabled(value) {
    if (value === null || value === false) {
      this.removeAttribute('disabled');
    } else {
      this.setAttribute('disabled', '');
    }
  }
}

if (!customElements.get('rf-option')) {
  customElements.define('rf-option', Option);
}