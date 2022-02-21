import inputStyle from 'inline!./src/components/input/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(inputStyle).then();

export class Input extends HTMLElement {
  static get observedAttributes() { return ['label', 'disabled', 'pattern', 'required', 'readonly', 'placeholder'] }

  constructor({ multi } = {}) {
    super();
    this.multi = multi;
    this.$customValidity = null;
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <rf-tips id="input-con" dir="${this.errordir}" type="error">
        ${
          this.icon ?
          '<rf-icon class="icon-pre" name=' + this.icon + '></rf-icon>'
          :
          ''
        }
        <${this.multi ? 'textarea' : 'input'} id="input" name="${this.name}" class="input" ${this.type === 'number' ? 'min="' + this.min + '" max="' + this.max + '" step="' + this.step + '"' : ""} value="${this.defaultvalue}" type="${this.typeMap(this.type)}" placeholder="${this.placeholder}" minlength="${this.minlength}" rows="${this.rows}" maxlength="${this.maxlength}">${this.multi ? '</textarea>' : ''}
        <slot></slot>
        ${
          this.label && !this.icon ?
          '<label class="input-label">' + this.label + '</label>'
          :
          ''
        }
        ${
          this.type === 'password' && !this.multi ?
          '<rf-button id="btn-pass" class="btn-right" icon="eye-close" type="flat" shape="circle"></rf-button>'
          :
          ''
        }
        ${
          this.type === 'search' && !this.multi ?
          '<rf-button id="btn-search" class="btn-right" icon="search" type="flat" shape="circle"></rf-button>'
          :
          ''
        }
        ${
          this.type === 'number' && !this.multi ?
          '<div class="btn-right btn-number"><rf-button id="btn-add" icon="up" type="flat"></rf-button><rf-button id="btn-sub" icon="down" type="flat"></rf-button></div>'
          :
          ''
        }
      </rf-tips>
    `;
    this.form = this.closest('rf-form');
    this.input = this.shadowRoot.getElementById('input');
    this.inputCon = this.shadowRoot.getElementById('input-con');
    this.input.addEventListener('input', (ev) => {
      ev.stopPropagation();
      this.checkValidity();
      if (this.debounce) {
        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.dispatchEvent(new CustomEvent('input', {
            detail: {
              value: this.value
            }
          }));
          if (this.list) {
            this.list.filter(this.value);
            this.list.show = true;
          }
        }, this.debounce)
      } else {
        this.dispatchEvent(new CustomEvent('input', {
          detail: {
            value: this.value
          }
        }));
        if (this.list) {
          this.list.filter(this.value);
          this.list.show = true;
        }
      }
    })
    this.input.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: this.value
        }
      }));
    })
    this.input.addEventListener('focus', (ev) => {
      this.checkValidity();
      if (this.list) {
        const { left, top, height, width } = this.getBoundingClientRect();
        this.list.style = `left:${left + window.scrollX}px;top:${top + height + window.scrollY}px;min-width:${width}px`;
        this.list.show = true;
      }
    })
    this.input.addEventListener('keydown', (ev) => {
      switch (ev.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          if (this.list) {
            ev.preventDefault();
            this.list.show = true;
          }
          break;
        case 'Escape':
        case 'Tab':
          if (this.list) {
            this.list.show = false;
          }
          break;
        case 'Enter':
          if (this.list) {
            ev.preventDefault();
            this.list.show = true;
          } else {
            this.dispatchEvent(new CustomEvent('submit', {
              detail: {
                value: this.value
              }
            }));
          }
          break;
        default:
          break;
      }
    })
    if (!this.multi) {
      this.btnPass = this.shadowRoot.getElementById('btn-pass');
      this.btnAdd = this.shadowRoot.getElementById('btn-add');
      this.btnSub = this.shadowRoot.getElementById('btn-sub');
      this.btnSearch = this.shadowRoot.getElementById('btn-search');
      if (this.btnSearch) {
        this.btnSearch.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('submit', {
            detail: {
              value: this.value
            }
          }));
        })
      }
      if (this.btnPass) {
        this.btnPass.addEventListener('click', () => {
          this.password = !this.password;
          if (this.password) {
            this.input.setAttribute('type', 'text');
            this.btnPass.icon = 'eye';
          } else {
            this.input.setAttribute('type', 'password');
            this.btnPass.icon = 'eye-close';
          }
          this.input.focus();
        })
      }
      if (this.btnAdd) {
        this.btnAdd.addEventListener('click', () => {
          this.input.stepUp();
          this.dispatchEvent(new CustomEvent('change', {
            detail: {
              value: this.value
            }
          }));
        })
      }
      if (this.btnSub) {
        this.btnSub.addEventListener('click', () => {
          this.input.stepDown();
          this.dispatchEvent(new CustomEvent('change', {
            detail: {
              value: this.value
            }
          }));
        })
      }
      this.pattern = this.pattern;
    }
    document.addEventListener('mousedown', this.setlist);

    if (this.list) {
      document.body.appendChild(this.list);
      this.list.addEventListener('submit', (ev) => {
        this.focus();
        if (ev.target.value) {
          this.value = ev.target.value;
          this.list.show = false;
          this.dispatchEvent(new CustomEvent('change', {
            detail: {
              value: this.value
            }
          }));
        }
      })
    }
    this.disabled = this.disabled;
    this.required = this.required;
    this.readonly = this.readonly;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'disabled' && this.input) {
      if (newValue !== null) {
        this.input.parentNode.setAttribute('tabindex', '-1');
      } else {
        this.input.parentNode.removeAttribute('tabindex');
      }
    }
    if (name == 'pattern' && this.input) {
      if (newValue !== null) {
        this.input.setAttribute('pattern', newValue);
      } else {
        this.input.removeAttribute('pattern');
      }
    }
    if (name == 'placeholder' && this.input) {
      if (newValue !== null) {
        this.input.setAttribute('placeholder', newValue);
      } else {
        this.input.removeAttribute('placeholder');
      }
    }
    if (name == 'required' && this.input) {
      if (newValue !== null) {
        this.input.setAttribute('required', 'required');
      } else {
        this.input.removeAttribute('required');
      }
    }
    if (name == 'readonly' && this.input) {
      if (newValue !== null) {
        this.input.setAttribute('readonly', 'readonly');
      } else {
        this.input.removeAttribute('readonly');
      }
    }
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this.setlist);
  }

  checkValidity() {
    if (this.novalidate || this.disabled || this.form && this.form.novalidate) {
      return true;
    }
    if (this.validity) {
      this.inputCon.show = false;
      this.invalid = false;
      return true;
    } else {
      this.input.focus();
      this.inputCon.show = 'show';
      this.invalid = true;
      if (this.input.validity.valueMissing) {
        this.inputCon.tips = this.input.validationMessage;
      } else {
        if (!this.customValidity.method(this)) {
          this.inputCon.tips = this.customValidity.tips;
        } else {
          this.inputCon.tips = this.errortips || this.input.validationMessage;
        }
      }
      return false;
    }
  }

  setlist = (ev) => {
    if (this.list) {
      if (this.contains(ev.target) || this.list.contains(ev.target)) {
        this.list.show = true;
      } else {
        this.list.show = false;
      }
    }
  }

  typeMap(type) {
    switch (type) {
      case 'password':
      case 'number':
      case 'email':
      case 'tel':
      case 'url':
        break;
      default:
        type = 'text'
        break;
    }
    return type;
  }

  focus() {
    this.input.focus();
  }

  reset() {
    this.input.value = this.defaultvalue;
    this.inputCon.show = false;
    this.invalid = false;
  }

  get customValidity() {
    return this.$customValidity || {
      method: () => true
    };
  }
  set customValidity(object) {
    this.$customValidity = object;
  }

  get value() {
    return this.input.value;
  }
  set value(value) {
    this.input.value = value;
    /*
    this.checkValidity();
    this.dispatchEvent(new CustomEvent('change',{
        detail:{
            value:this.value
        }
    }));
    */
  }

  get debounce() {
    return this.getAttribute('debounce');
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

  get name() {
    return this.getAttribute('name') || '';
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

  get readonly() {
    return this.getAttribute('readonly') !== null;
  }
  set readonly(value) {
    if (value === null || value === false) {
      this.removeAttribute('readonly');
    } else {
      this.setAttribute('readonly', '');
    }
  }

  get validity() {
    return this.input.checkValidity() && this.customValidity.method(this);
  }

  get errordir() {
    return this.getAttribute('errordir') || 'top';
  }

  get defaultvalue() {
    return this.getAttribute('defaultvalue') || '';
  }
  get rows() {
    return this.getAttribute('rows') || 3;
  }

  get icon() {
    return this.getAttribute('icon');
  }
  set icon(value) {
    this.setAttribute('icon', value);
  }

  get type() {
    return this.getAttribute('type');
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

  get label() {
    return this.getAttribute('label') || '';
  }
  set label(value) {
    this.setAttribute('label', value);
  }

  get placeholder() {
    return this.getAttribute('placeholder') || this.label;
  }
  set placeholder(value) {
    this.setAttribute('placeholder', value);
  }

  get min() {
    return this.getAttribute('min') || 0;
  }

  get max() {
    return this.getAttribute('max') || Infinity;
  }

  get minlength() {
    return this.getAttribute('minlength') || '';
  }

  get maxlength() {
    return this.getAttribute('maxlength') || '';
  }

  get step() {
    return this.getAttribute('step') || 1;
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

  get pattern() {
    return this.getAttribute('pattern');
  }
  set pattern(value) {
    if (value === null || value === false) {
      this.removeAttribute('pattern');
    } else {
      this.setAttribute('pattern', value);
    }
  }

  get errortips() {
    return this.getAttribute('errortips');
  }

  get list() {
    const list = this.getAttribute('list');
    if (list) {
      return this.getRootNode().getElementById(list);
    }
    return null;
  }

  get options() {
    if (this.list) {
      return this.list.options;
    }
    return [];
  }
}

export class Textarea extends Input {
  constructor() {
    super({ multi: true });
  }
}

if (!customElements.get('rf-input')) {
  customElements.define('rf-input', Input);
}
if (!customElements.get('rf-textarea')) {
  customElements.define('rf-textarea', Textarea);
}