import tipsStyle from 'inline!./src/components/tips/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(tipsStyle).then();

export default class Tips extends HTMLElement {
  static get observedAttributes() { return ['color'] }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <slot></slot>
    `;
  }

  connectedCallback() {
    if (this.dir === 'auto') {
      const { left, top, width, height } = this.getBoundingClientRect();
      const w = document.body.scrollWidth;
      const h = document.body.scrollHeight;
      const TIP_SIZE = 50;
      if (top < TIP_SIZE) {
        this.dir = 'bottom';
      }
      if (h - top - height < TIP_SIZE) {
        this.dir = 'top';
      }
      if (left < TIP_SIZE) {
        this.dir = 'right';
      }
      if (w - left - width < TIP_SIZE) {
        this.dir = 'left';
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'color' && this.shadowRoot) {
      this.style.setProperty('--color', newValue);
    }
  }

  get color() {
    return this.getAttribute('color') || '';
  }
  set color(value) {
    this.setAttribute('color', value);
  }

  get dir() {
    return this.getAttribute('dir') || 'top';
  }
  set dir(value) {
    this.setAttribute('dir', value);
  }

  get tips() {
    return this.getAttribute('tips');
  }
  set tips(value) {
    this.setAttribute('tips', value);
  }

  get type() {
    return this.getAttribute('tips');
  }
  set type(value) {
    this.setAttribute('type', value);
  }

  get suffix() {
    return this.getAttribute('suffix') || '';
  }
  set suffix(value) {
    this.setAttribute('suffix', value);
  }

  get prefix() {
    return this.getAttribute('prefix') || '';
  }
  set prefix(value) {
    this.setAttribute('prefix', value);
  }

  get show() {
    return this.getAttribute('show') !== null;
  }
  set show(value) {
    this.setAttribute('show', value);
  }
}

if (!customElements.get('rf-tips')) {
  customElements.define('rf-tips', Tips);
}