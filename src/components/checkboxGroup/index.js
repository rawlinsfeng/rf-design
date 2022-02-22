import checkboxGroupStyle from 'inline!./src/components/checkboxGroup/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(checkboxGroupStyle).then();

export default class CheckboxGroup extends HTMLElement {
  static get observedAttributes() { return ['disabled', 'required'] }

  constructor() {
    super();
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <rf-tips id="tip" ${this.disabled ? "tabindex='-1'" : ""} type="error"><slot></slot></rf-tips>
    `;
    this.form = this.closest('rf-form');
    this.tip = this.shadowRoot.getElementById('tip');
    this.slots = this.shadowRoot.querySelector('slot');
    this.slots.addEventListener('slotchange', () => {
      this.elements = this.querySelectorAll('rf-checkbox');
      this.value = this.defaultvalue.split(',');
      this.elements.forEach(el => {
        el.addEventListener('change', () => {
          this.checkValidity();
          this.dispatchEvent(new CustomEvent('change', {
            detail: {
              value: this.value
            }
          }));
        })
      })
      this.init = true;
    })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'disabled' && this.tip) {
      if (newValue !== null) {
        this.tip.setAttribute('tabindex', -1);
      } else {
        this.tip.removeAttribute('tabindex');
      }
    }
  }

  focus() {
    if (getComputedStyle(this.tip).zIndex != 2) {
      this.elements[0].focus();
    }
  }

  reset() {
    this.elements.forEach(el => {
      el.checked = false;
    })
    this.error = false;
    this.tip.show = false;
  }

  checkall() {
    this.elements.forEach(el => {
      el.checked = true;
    })
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
      if (this.len < this.min) {
        this.tip.tips = `请至少选择${this.min}项`;
      }
      if (this.len > this.max) {
        this.tip.tips = `至多选择${this.max}项`;
      }
      return false;
    }
  }

  get name() {
    return this.getAttribute('name');
  }

  get min() {
    const min = this.getAttribute('min') || 0;
    return this.required ? Math.max(1, min) : min;
  }

  get max() {
    return this.getAttribute('max') || Infinity;
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

  get defaultvalue() {
    return this.getAttribute('defaultvalue') || "";
  }

  get value() {
    return [...this.querySelectorAll('rf-checkbox[checked]')].map(el => el.value);
  }
  set value(value) {
    this.elements.forEach(el => {
      if (value.includes(el.value)) {
        el.checked = true;
      } else {
        el.checked = false;
      }
    })
    if (this.init) {
      this.checkValidity();
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: value
        }
      }));
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

  get validity() {
    this.len = this.value.length;
    if (!this.required && this.len == 0) {
      return true;
    }
    return this.len >= this.min && this.len <= this.max;
  }
}

if (!customElements.get('rf-checkbox-group')) {
  customElements.define('rf-checkbox-group', CheckboxGroup);
}