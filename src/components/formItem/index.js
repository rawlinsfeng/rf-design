import formItemStyle from 'inline!./src/components/formItem/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(formItemStyle).then();

export default class FormItem extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <label>${this.legend}</label>
      <div class="item"><slot></slot></slot>
    `;
    this.form = this.closest('rf-form');
    this.labels = this.shadowRoot.querySelector('label');
    this.slots = this.shadowRoot.querySelector('slot');
    this.slots.addEventListener('slotchange', () => {
      this.input = this.querySelector('[name]');
      if (this.input && this.input.required) {
        this.labels.classList.add('required');
      }
    })
  }

  get legend() {
    return this.getAttribute('legend') || '';
  }
  set legend(value) {
    this.setAttribute('legend', value);
  }
}

if (!customElements.get('rf-form-item')) {
  customElements.define('rf-form-item', FormItem);
}