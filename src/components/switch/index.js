import switchStyle from 'inline!./src/components/switch/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(switchStyle).then(console.log); // will log the CSSStyleSheet object
// everythingTomato.replaceSync(switchStyle)

export default class Switch extends HTMLElement {

  static get observedAttributes() { return ['disabled','checked'] }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <input type="checkbox" id="switch"><label for="switch"></label>
    `
  }

  connectedCallback() {
    this.switch = this.shadowRoot.getElementById('switch');
    this.disabled = this.disabled;
    this.checked = this.checked;
    this.switch.addEventListener('change', (ev) => {
      this.checked = this.switch.checked;
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          checked: this.checked
        }
      }));
    })
    this.switch.addEventListener('keydown', (ev) => {
      switch (ev.code) {
        case 'Enter':
          this.checked = !this.checked;
          break;
        default:
          break;
      }
    })
    this.switch.addEventListener('focus',(ev) => {
      ev.stopPropagation();
      if (!this.isfocus) {
        this.dispatchEvent(new CustomEvent('focus', {
          detail: {
            value: this.value
          }
        }));
      }
    })
    this.switch.addEventListener('blur',(ev) => {
      ev.stopPropagation();
      if (getComputedStyle(this.switch).zIndex == 2) {
        this.isfocus = true;
      } else {
        this.isfocus = false;
        this.dispatchEvent(new CustomEvent('blur', {
          detail:{
            value: this.value
          }
        }));
      }
    })
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if ( name == 'disabled' && this.switch) {
      if (newValue !== null) {
        this.switch.setAttribute('disabled', 'disabled');
      } else {
        this.switch.removeAttribute('disabled');
      }
    }
    if ( name == 'checked' && this.switch) {
      if (newValue !== null) {
        this.switch.checked = true;
      } else {
        this.switch.checked = false;
      }
    }
  }

  focus() {
    this.switch.focus();
  }

  get disabled() {
    return this.getAttribute('disabled') !== null;
  }

  get checked() {
    return this.getAttribute('checked') !== null;
  }

  get name() {
    return this.getAttribute('name');
  }

  set disabled(value) {
    if (value===null || value===false) {
      this.removeAttribute('disabled');
    } else {
      this.setAttribute('disabled', '');
    }
  }

  set checked(value) {
    if (value===null || value===false) {
      this.removeAttribute('checked');
    } else {
      this.setAttribute('checked', '');
    }
  }
}

if (!customElements.get('rf-switch')) {
  customElements.define('rf-switch', Switch);
}