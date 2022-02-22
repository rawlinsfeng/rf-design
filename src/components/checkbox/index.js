import checkboxStyle from 'inline!./src/components/checkbox/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(checkboxStyle).then();

export default class Checkbox extends HTMLElement {
  static get observedAttributes() { return ['disabled', 'checked', 'required'] }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <rf-tips id="tip" type="error" dir="topleft"><input type="checkbox" id="checkbox"><label for="checkbox"><span class="cheked"></span><slot></slot></label></rf-tips>
    `;
  }

  connectedCallback() {
    this.form = this.closest('rf-form');
    this.checkbox = this.shadowRoot.getElementById('checkbox');
    this.tip = this.shadowRoot.getElementById('tip');
    this.disabled = this.disabled;
    this.checked = this.checked;
    this.checkbox.addEventListener('change', (ev) => {
      this.checked = this.checkbox.checked;
    })
    this.checkbox.addEventListener('keydown', (ev) => {
      switch (ev.code) {
        case 'Enter':
          ev.stopPropagation();
          this.checked = !this.checked;
          break;
        default:
          break;
      }
    })
    this.checkbox.addEventListener('focus', (ev) => {
      ev.stopPropagation();
      if (!this.isfocus) {
        this.dispatchEvent(new CustomEvent('focus', {
          detail: {
            value: this.value
          }
        }));
      }
    })
    this.checkbox.addEventListener('blur', (ev) => {
      ev.stopPropagation();
      if (getComputedStyle(this.checkbox).zIndex == 2) {
        this.isfocus = true;
      } else {
        this.isfocus = false;
        this.dispatchEvent(new CustomEvent('blur', {
          detail: {
            value: this.value
          }
        }));
      }
    })
    this.required = this.required;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'disabled' && this.checkbox) {
      if (newValue !== null) {
        this.checkbox.setAttribute('disabled', 'disabled');
      } else {
        this.checkbox.removeAttribute('disabled');
      }
    }
    if (name == 'checked' && this.checkbox) {
      if (newValue !== null) {
        this.checkbox.checked = true;
      } else {
        this.checkbox.checked = false;
      }
      if (oldValue !== newValue) {
        this.checkValidity();
        this.dispatchEvent(new CustomEvent('change', {
          detail: {
            checked: this.checked
          }
        }));
      }
    }
    if (name == 'required' && this.checkbox) {
      if (newValue !== null) {
        this.checkbox.setAttribute('required', 'required');
      } else {
        this.checkbox.removeAttribute('required');
      }
    }
  }

  focus() {
    this.checkbox.focus();
  }

  reset() {
    this.tip.show = false;
    this.checkbox.checked = false;
  }

  checkValidity() {
    if (this.novalidate || this.disabled || this.form && this.form.novalidate) {
      return true;
    }
    if (this.validity) {
      this.tip.show = false;
      return true;
    } else {
      this.focus();
      this.tip.show = 'show';
      this.tip.tips = this.errortips || this.checkbox.validationMessage;
      return false;
    }
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

  get novalidate() {
    return this.getAttribute('novalidate') !== null;
  }
  set novalidate(value) {
    if (value === null || value === false) {
      this.removeAttribute('novalidate');
    } else {
      this.setAttribute('novalidate', '');
    }
  }

  get required() {
    return this.getAttribute('required') !== null;
  }
  set required(value) {
    if (value === null || value === false) {
      this.removeAttribute('required');
    } else {
      this.setAttribute('required', '');
    }
  }

  get name() {
    return this.getAttribute('name');
  }

  get checked() {
    return this.getAttribute('checked') !== null;
  }
  set checked(value) {
    if (value === null || value === false) {
      this.removeAttribute('checked');
    } else {
      this.setAttribute('checked', '');
    }
  }

  get value() {
    return this.getAttribute('value') || this.textContent;
  }

  get validity() {
    return this.checkbox.checkValidity();
  }

  get errortips() {
    return this.getAttribute('errortips');
  }
}

if (!customElements.get('rf-checkbox')) {
  customElements.define('rf-checkbox', Checkbox);
}