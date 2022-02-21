import Popcon from '../popcon/index.js';
import popoverStyle from 'inline!./src/components/popover/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(popoverStyle).then();

export default class Popover extends HTMLElement {
  static get observedAttributes() { return ['title', 'oktext', 'canceltext', 'loading', 'type'] }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <slot></slot>
    `;
  }

  connectedCallback() {
    this.popcon = this.querySelector('rf-popcon');
    if (!(this.trigger && this.trigger !== 'click')) {
      this.addEventListener('click', this.show);
    }
    if (this.trigger === 'contextmenu') {
      this.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        const path = ev.path || (ev.composedPath && ev.composedPath());
        if (!path.includes(this.popcon)) {
          this.show(ev);
        }
      });
    }
    document.addEventListener('mousedown', this.setpop);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'loading' && this.popcon) {
      if (newValue !== null) {
        this.popcon.loading = true;
      } else {
        this.popcon.loading = false;
      }
    }
    if (name == 'title' && this.popcon) {
      if (newValue !== null) {
        this.popcon.title = newValue;
      }
    }
    if (name == 'oktext' && this.popcon) {
      if (newValue !== null) {
        this.popcon.oktext = newValue;
      }
    }
    if (name == 'canceltext' && this.popcon) {
      if (newValue !== null) {
        this.popcon.canceltext = newValue;
      }
    }
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this.popcon);
  }

  show(ev) {
    this.popcon = this.querySelector('rf-popcon');
    if (!this.disabled) {
      if (!this.popcon) {
        this.popcon = new Popcon(this.type);
        this.popcon.type = this.type;
        this.appendChild(this.popcon);
        this.popcon.title = this.title || 'popover';
        this.popcon.innerHTML = this.content || '';
        if (this.type == 'confirm') {
          this.popcon.oktext = this.oktext || '确 定';
          this.popcon.canceltext = this.canceltext || '取 消';
          this.popcon.onsubmit = () => {
            this.dispatchEvent(new CustomEvent('submit'));
          }
          this.popcon.oncancel = () => {
            this.dispatchEvent(new CustomEvent('cancel'));
          }
        }
      }
      //this.popcon.remove = true;
      this.popcon.clientWidth;
      if (this.trigger === 'contextmenu') {
        const { x, y } = this.getBoundingClientRect()
        this.popcon.style.setProperty('--x', ev.clientX - x + 'px');
        this.popcon.style.setProperty('--y', ev.clientY - y + 'px');
        this.popcon.open = true;
      } else {
        const path = ev.path || (ev.composedPath && ev.composedPath());
        if (!path.includes(this.popcon)) {
          window.rfActiveElement = document.activeElement;
          if (this.accomplish) {
            this.popcon.open = true;
          } else {
            this.popcon.open = !this.popcon.open;
          }
        }
      }
    } else {
      (this.popcon || this).dispatchEvent(new CustomEvent('submit'));
    }
    return this.popcon;
  }

  setpop = (ev) => {
    const path = ev.path || (ev.composedPath && ev.composedPath());
    if (this.popcon && !path.includes(this.popcon) && !this.popcon.loading && !path.includes(this.children[0]) || (this.trigger === 'contextmenu') && !path.includes(this.popcon) && ev.which == '1') {
      this.popcon.open = false;
    }
  }

  get title() {
    return this.getAttribute('title') || 'popcon';
  }
  set title(value) {
    this.setAttribute('title', value);
  }

  get trigger() {
    return this.getAttribute('trigger');
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

  get type() {
    return this.getAttribute('type');
  }
  set type(value) {
    this.setAttribute('type', value);
  }

  get accomplish() {
    return this.getAttribute('accomplish') !== null;
  }

  get content() {
    return this.getAttribute('content');
  }

  get oktext() {
    return this.getAttribute('oktext');
  }
  set oktext(value) {
    this.setAttribute('oktext', value);
  }

  get canceltext() {
    return this.getAttribute('canceltext');
  }
  set canceltext(value) {
    this.setAttribute('canceltext', value);
  }

  get dir() {
    return this.getAttribute('dir');
  }
  set dir(value) {
    this.setAttribute('dir', value);
  }

  get loading() {
    return this.getAttribute('loading') !== null;
  }
  set loading(value) {
    if (value === null || value === false) {
      this.removeAttribute('loading');
    } else {
      this.setAttribute('loading', '');
    }
  }
}

if (!customElements.get('rf-popover')) {
  customElements.define('rf-popover', Popover);
}