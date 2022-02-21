export default class Select extends HTMLElement {
  static get observedAttributes() { return ['value', 'disabled', 'type'] }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
    `;
  }
}