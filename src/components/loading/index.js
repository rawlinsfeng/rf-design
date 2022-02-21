import loadingStyle from 'inline!./src/components/loading/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(loadingStyle).then();

export default class Loading extends HTMLElement {

  static get observedAttributes() { return ['color','size'] }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <svg class="loading" id="loading" viewBox="22 22 44 44"><circle class="circle" cx="44" cy="44" r="20.2" fill="none" stroke-width="3.6"></circle></svg>
      <slot></slot>
    `;
  }

  connectedCallback() {
    this.loading = this.shadowRoot.getElementById('loading');
    this.size && (this.size = this.size);
    this.color && (this.color = this.color);
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if ( name == 'color' && this.loading) {
      this.loading.style.color = newValue;
    }
    if ( name == 'size' && this.loading) {
      this.loading.style.fontSize = newValue + 'px';
    }
  }

  get size() {
    return this.getAttribute('size') || '';
  }
  set size(value) {
    this.setAttribute('size', value);
  }

  get color() {
    return this.getAttribute('color') || '';
  }
  set color(value) {
    this.setAttribute('color', value);
  }
}

if (!customElements.get('rf-loading')) {
  customElements.define('rf-loading', Loading);
}