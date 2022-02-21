import formStyle from 'inline!./src/components/form/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(formStyle).then();

export default class Form extends HTMLElement {

  static get observedAttributes() { return ['disabled'] }

  constructor() {
    super();
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <form id="form" method="${this.method}" action="${this.action}" ${this.novalidate ? 'novalidate' : ''}>
        <slot></slot>
      </form>
    `;
    this.form = this.shadowRoot.getElementById('form');
    this.elements = [...this.querySelectorAll('[name]:not([disabled])')];
    this.submitBtn = this.querySelector('[htmltype=submit]');
    this.resetBtn = this.querySelector('[htmltype=reset]');
    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', () => {
        this.submit();
      });
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.reset();
      });
    }
    this.form.addEventListener('keydown', (ev) => {
      if (ev.target == this.resetBtn) {
        return
      }
      switch (ev.code) {
        case 'Enter':
          this.submit();
          break;
        default:
          break;
      }
    })
    if (!this.novalidate) {
      this.elements.forEach((el) => {
        if (el.tagName == "XY-INPUT") {
          el.addEventListener('input', () => {
            this.invalid = !this.validity;
          })
        } else {
          el.addEventListener('change', () => {
            this.invalid = !this.validity;
          })
        }
      })
    }
  }

  checkValidity() {
    if (this.novalidate) {
      return true;
    }
    const elements = [...this.elements].reverse();
    let validity = true;
    elements.forEach(el => {
      if (el.checkValidity && !el.checkValidity()) {
        validity = false;
      }
    })
    this.invalid = !validity;
    return validity;
  }

  async submit() {
    if (this.checkValidity() && !this.disabled) {
      //validity
      if (this.action) {
        this.submitBtn && (this.submitBtn.loading = true);
        if (this.method == 'GET') {
          const formdata = new URLSearchParams(this.formdata).toString();
          const data = await fetch(`${this.action}?${formdata}`);
          this.submitBtn && (this.submitBtn.loading = false);
          if (data.headers.get("content-type") == 'application/json') {
            this.dispatchEvent(new CustomEvent('submit', {
              detail: {
                data: data.json()
              }
            }));
          }
        } else {
          const data = await fetch(this.action, {
            method: 'POST',
            body: this.formdata,
          })
          this.submitBtn && (this.submitBtn.loading = false);
          if (data.headers.get("content-type") == 'application/json') {
            this.dispatchEvent(new CustomEvent('submit', {
              detail: {
                data: data.json()
              }
            }));
          }
        }
      }
    }
  }

  reset() {
    this.invalid = false;
    this.elements.forEach(el => {
      el.reset && el.reset();
    })
  }

  get validity() {
    return this.elements.every(el => el.validity);
  }

  get disabled() {
    return this.getAttribute('disabled') !== null;
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

  get formdata() {
    const formdata = new FormData();
    const jsondata = {};
    if (!this.disabled) {
      this.elements.forEach(el => {
        formdata.set(el.name, el.value);
        jsondata[el.name] = el.value;
      })
    }
    formdata.json = jsondata;
    return formdata;
  }

  get method() {
    const method = (this.getAttribute('method') || 'get').toUpperCase();
    if (['GET', 'POST'].includes(method)) {
      return method;
    }
    return 'GET';
  }

  get action() {
    return this.getAttribute('action') || '';
  }

  get name() {
    return this.getAttribute('name');
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

  set type(value) {
    this.setAttribute('type', value);
  }

  /*
  get enctype() {
      const enctype = this.getAttribute('enctype');
      if( ['application/x-www-form-urlencoded','multipart/form-data','text/plain'].includes(enctype) ){
          return enctype;
      }
      return 'application/x-www-form-urlencoded';
  }
  */
}

if (!customElements.get('rf-form')) {
  customElements.define('rf-form', Form);
}