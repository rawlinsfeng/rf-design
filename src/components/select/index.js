import selectStyle from 'inline!./src/components/select/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(selectStyle).then();

export default class Select extends HTMLElement {
  static get observedAttributes() { return ['value', 'disabled', 'type'] }

  constructor() {
    super();
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <style id="filter"></style>
      <rf-popover id="root" ${this.search ? "accomplish" : ""}>
        <rf-tips id="tip" type="error">
          <${this.search ? 'rf-input' : 'rf-button'} id="select" debounce="200" readonly ${this.disabled ? "disabled" : ""} ${this.type ? ("type=" + this.type) : ""}>
          ${this.search ? "" : '<span id="value"></span>'}
          <svg class="arrow" viewBox="0 0 1024 1024"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z"></path></svg></${this.search ? 'rf-input' : 'rf-button'}>
        </rf-tips>
        <rf-popcon id="options">
          <slot id="slot"></slot>
        </rf-popcon>
      </rf-popover>
    `;
    this.form = this.closest('rf-form');
    this.root = this.shadowRoot.getElementById('root');
    this.select = this.shadowRoot.getElementById('select');
    this.options = this.shadowRoot.getElementById('options');
    this.slots = this.shadowRoot.getElementById('slot');
    this.txt = this.shadowRoot.getElementById('value');
    this.tip = this.shadowRoot.getElementById('tip');
    this.focusIndex = -1;
    this.addEventListener('keydown', (ev) => {
      if (this.options.open) {
        switch (ev.code) {
          case 'Tab':
            ev.preventDefault();
            break;
          case 'ArrowUp':
            ev.preventDefault();
            this.move(-1);
            break;
          case 'ArrowDown':
            ev.preventDefault();
            this.move(1);
            break;
          case 'Esc':
            ev.preventDefault();
            this.options.open = false;
            break;
          default:
            break;
        }
      } else {
        switch (ev.code) {
          case 'ArrowUp':
            ev.preventDefault();
            this.movein(-1);
            break;
          case 'ArrowDown':
            ev.preventDefault();
            this.movein(1);
            break;
          default:
            break;
        }
      }
    })
    this.select.addEventListener('focus', (ev) => {
      ev.stopPropagation();
      if (!this.isfocus) {
        this.checkValidity();
        this.dispatchEvent(new CustomEvent('focus', {
          detail: {
            value: this.value
          }
        }));
      }
    })
    this.options.addEventListener('click', (ev) => {
      this.focus();
      const item = ev.target.closest('rf-option');
      if (item) {
        this.nativeclick = true;
        this.value = item.value;
      }
    })
    this.options.addEventListener('close', (ev) => {
      if (this.search) {
        this.select.readonly = true;
        this.select.value = this.$text;
        //this.value = this.$value;
        this.nodes = [...this.querySelectorAll(`rf-option:not([disabled])`)];
        this.filter.textContent = '';
        this.empty = false;
      }
      const place = this.querySelector(`rf-option[focusin]`);
      const current = this.querySelector(`rf-option[selected]`);
      if (place) {
        place.focusin = false;
      }
      if (current) {
        current.focusin = true;
        this.focusIndex = this.nodes.indexOf(current);
      } else {
        this.focusIndex = -1;
      }
    })
    this.options.addEventListener('open', (ev) => {
      if (this.search) {
        this.select.value = '';
        this.select.readonly = false;
        this.focus();
      }
    })
    if (this.search) {
      this.filter = this.shadowRoot.getElementById('filter');
      this.select.addEventListener('input', (ev) => {
        const value = this.select.value.trim();
        if (value === "") {
          this.nodes = [...this.querySelectorAll(`rf-option:not([disabled])`)];
          this.filter.textContent = '';
        } else {
          this.nodes = [...this.querySelectorAll(`rf-option[key*="${value}" i]:not([disabled])`)];
          this.filter.textContent = `
            :host([search]) ::slotted(rf-option:not([key*="${value}" i]))
            {
              display:none;
            }
          `;
        }
        const place = this.querySelector(`rf-option[focusin]`);
        if (place) {
          place.focusin = false;
        }
        if (this.nodes[0]) {
          this.nodes[0].focusin = true;
          this.empty = false;
        } else {
          this.empty = true;
        }
        this.focusIndex = 0;
      })
      this.select.addEventListener('submit', (ev) => {
        if (!this.options.open) {
          this.options.open = true;
        } else {
          const item = this.nodes[this.focusIndex];
          this.nativeclick = true;
          if (item) {
            this.value = item.value;
          } else {
            this.value = this.$value;
            this.options.open = false;
          }
        }
      })
    } else {
      this.addEventListener('click', (ev) => {
        if (!this.options.open) {
          const item = this.nodes[this.focusIndex];
          if (item) {
            this.nativeclick = true;
            this.value = item.value;
          }
        }
      })
    }
    this.select.addEventListener('blur', (ev) => {
      ev.stopPropagation();
      if (getComputedStyle(this.root).zIndex == 2) {
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
    this.slots.addEventListener('slotchange', () => {
      this.nodes = [...this.querySelectorAll(`rf-option:not([disabled])`)];
      if (!this.defaultvalue) {
        this.value = '';
      } else {
        this.value = this.defaultvalue;
      }
      this.init = true;
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'disabled' && this.select) {
      if (newValue != null) {
        this.select.disabled = true;
      } else {
        this.select.disabled = false;
      }
    }
  }

  move(dir) {
    const pre = this.nodes[this.focusIndex];
    const focusIndex = dir + this.focusIndex;
    const current = this.nodes[focusIndex];
    if (current) {
      if (pre) {
        pre.focusin = false;
      }
      current.focusin = true;
      this.focusIndex = focusIndex;
    }
  }

  movein(dir) {
    this.focusIndex = dir + this.focusIndex;
    if (this.focusIndex < 0) {
      this.focusIndex = this.nodes.length - 1;
    }
    if (this.focusIndex === this.nodes.length) {
      this.focusIndex = 0;
    }
    this.nativeclick = true;
    this.value = this.nodes[this.focusIndex].value;
  }

  focus() {
    this.select.focus();
  }

  reset() {
    this.value = this.defaultvalue;
    this.tip.show = false;
    this.invalid = false;
  }

  checkValidity() {
    if (this.novalidate || this.disabled || this.form && this.form.novalidate) {
      return true;
    }
    if (this.validity) {
      this.tip.show = false;
      this.invalid = false;
      return true;
    } else {
      this.focus();
      this.tip.show = 'show';
      this.invalid = true;
      this.tip.tips = this.errortips;
      return false;
    }
  }

  get defaultvalue() {
    return this.getAttribute('defaultvalue') || '';
  }
  set defaultvalue(value) {
    this.setAttribute('defaultvalue', value);
  }

  get value() {
    return this.$value || '';
  }
  set value(value) {
    if (value === '') {
      this.$value = '';
      this.$text = this.placeholder;
      if (this.focusIndex >= 0) {
        const current = this.nodes[this.focusIndex];
        if (current) {
          this.focusIndex = -1;
          current.selected = false;
          current.focusin = false;
        }
      }
      if (this.search) {
        this.select.placeholder = this.placeholder;
        this.select.value = '';
      } else {
        this.txt.textContent = this.placeholder;
      }
      return
    }
    if (value !== this.value) {
      this.$value = value;
      const pre = this.querySelector(`rf-option[selected]`);
      if (pre) {
        pre.selected = false;
        pre.focusin = false;
      }
      const cur = this.querySelector(`rf-option[value="${value}"]`) || this.querySelector(`rf-option`);
      this.focusIndex = this.nodes.indexOf(cur);
      cur.selected = true;
      cur.focusin = true;
      this.$text = cur.textContent;
      if (this.search) {
        this.select.placeholder = this.$text;
        this.select.value = this.$text;
      } else {
        this.txt.textContent = this.$text;
      }
      if (this.nativeclick) {
        this.nativeclick = false;
        this.checkValidity();
        this.dispatchEvent(new CustomEvent('change', {
          detail: {
            value: value,
            text: this.$text
          }
        }));
      }
    }
    this.options.open = false;
  }

  get text() {
    return this.$text || this.placeholder;
  }

  get name() {
    return this.getAttribute('name');
  }

  get empty() {
    return this.getAttribute('empty') !== null;
  }
  set empty(value) {
    if (value === null || value === false) {
      this.removeAttribute('empty');
    } else {
      this.setAttribute('empty', '');
    }
  }

  get type() {
    return this.getAttribute('type');
  }

  get validity() {
    return this.required ? this.value !== '' : true;
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

  get errortips() {
    return this.getAttribute('errortips') || '请选择一项';
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

  get invalid() {
    return this.getAttribute('invalid') !== null;
  }
  set invalid(value) {
    if (value === null || value === false) {
      this.removeAttribute('invalid');
    } else {
      this.setAttribute('invalid', '');
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

  get search() {
    return this.getAttribute('search') !== null;
  }

  get placeholder() {
    return this.getAttribute('placeholder') || '请选择';
  }
}

if (!customElements.get('rf-select')) {
  customElements.define('rf-select', Select);
}