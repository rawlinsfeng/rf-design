import buttonStyle from 'inline!./src/components/button/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(buttonStyle).then();

export default class Button extends HTMLElement {
  static get observedAttributes() { return ['disabled','icon','loading','href','htmltype'] }

  constructor() {
    super();
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <${this.href?'a':'button'} ${this.htmltype?'type="'+this.htmltype+'"':''} ${(this.download&&this.href)?'download="'+this.download+'"':''} ${this.href?'href="'+this.href+'" target="'+this.target+'" rel="'+this.rel+'"':''} class="btn" id="btn"></${this.href?'a':'button'}>${!this.loading && this.icon && this.icon!='null'?'<rf-icon id="icon" name='+this.icon+'></rf-icon>':''}<slot></slot>
    `;
    this.btn = this.shadowRoot.getElementById('btn');
    this.ico = this.shadowRoot.getElementById('icon');
    this.load = document.createElement('rf-loading');
    this.load.style.color = 'inherit';

    this.btn.addEventListener('mousedown', (ev) => {
      //ev.preventDefault();
      //ev.stopPropagation();
      if (!this.disabled) {
        const { left, top } = this.getBoundingClientRect();
        this.style.setProperty('--x',(ev.clientX - left)+'px');
        this.style.setProperty('--y',(ev.clientY - top)+'px');
      }
    })
    this.addEventListener('click', (ev) => {
      if (this.toggle) {
        this.checked = !this.checked;
      }
    })
    this.btn.addEventListener('keydown', (ev) => {
      switch (ev.code) {
        case 'Enter':
          ev.stopPropagation();
          break;
        default:
          break;
      }
    })
    this.disabled = this.disabled;
    this.loading = this.loading;
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name == 'disabled' && this.btn) {
      if (newValue !== null) {
        this.btn.setAttribute('disabled', 'disabled');
        if (this.href) {
          this.btn.removeAttribute('href');
        }
      } else {
        this.btn.removeAttribute('disabled');
        if (this.href) {
          this.btn.href = this.href;
        }
      }
    }
    if (name == 'loading' && this.btn) {
      if (newValue !== null) {
        this.shadowRoot.prepend(this.load);
        this.btn.setAttribute('disabled', 'disabled');
      } else {
        this.shadowRoot.removeChild(this.load);
        this.btn.removeAttribute('disabled');
      }
    }
    if (name == 'icon' && this.ico) {
      this.ico.name = newValue;
    }
    if (name == 'href' && this.btn) {
      if (!this.disabled) {
        this.btn.href = newValue;
      }
    }
    if (name == 'htmltype' && this.btn) {
      this.btn.type = newValue;
    }
  }

  focus() {
    this.btn.focus();
  }

  get disabled() {
    return this.getAttribute('disabled') !== null;
  }
  set disabled(value) {
    if (value===null || value===false) {
      this.removeAttribute('disabled');
    } else {
      this.setAttribute('disabled', '');
    }
  }

  get toggle() {
    return this.getAttribute('toggle') !== null;
  }

  get htmltype() {
    return this.getAttribute('htmltype');
  }
  set htmltype(value) {
    this.setAttribute('htmltype', value);
  }

  get name() {
    return this.getAttribute('name');
  }

  get checked() {
    return this.getAttribute('checked') !== null;
  }
  set checked(value) {
    if (value===null || value===false) {
      this.removeAttribute('checked');
    } else {
      this.setAttribute('checked', '');
    }
  }

  get href() {
    return this.getAttribute('href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }

  get target() {
    return this.getAttribute('target') || '_blank';
  }

  get rel() {
    return this.getAttribute('rel');
  }

  get download() {
    return this.getAttribute('download');
  }

  get icon() {
    return this.getAttribute('icon');
  }
  set icon(value) {
    this.setAttribute('icon', value);
  }

  get loading() {
    return this.getAttribute('loading') !== null;
  }
  set loading(value) {
    if(value===null || value===false){
      this.removeAttribute('loading');
    } else {
      this.setAttribute('loading', '');
    }
  }
}

if (!customElements.get('rf-button')) {
  customElements.define('rf-button', Button);
}