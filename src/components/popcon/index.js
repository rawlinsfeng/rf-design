import popconStyle from 'inline!./src/components/popcon/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(popconStyle).then();

export default class Popcon extends HTMLElement {
  static get observedAttributes() { return ['open','title','oktext','canceltext','loading','type'] }

  constructor(type) {
    super();
    this.type = type;
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      ${
        this.type==='confirm'?'<rf-icon id="popcon-type" class="popcon-type" name="question-circle" color="var(--waringColor,#faad14)"></rf-icon>':''
      }
      <div class="popcon-content">
        ${
          this.type!==null?'<div class="popcon-title" id="title">'+this.title+'</div><rf-button class="btn-close" id="btn-close" icon="close"></rf-button>':''
        }
        <div class="popcon-body">
          <slot></slot>
        </div>
        ${
          this.type==='confirm'?'<div class="popcon-footer"><rf-button id="btn-cancel">'+this.canceltext+'</rf-button><rf-button id="btn-submit" type="primary">'+this.oktext+'</rf-button></div>':''
        }
      </div>
    `;
    this.remove = false;
    if (this.type) {
      this.titles = this.shadowRoot.getElementById('title');
      this.btnClose = this.shadowRoot.getElementById('btn-close');
    }
    if (this.type == 'confirm') {
      this.btnCancel = this.shadowRoot.getElementById('btn-cancel');
      this.btnSubmit = this.shadowRoot.getElementById('btn-submit');
    }
    this.addEventListener('transitionend',(ev) => {
      if (ev.propertyName === 'transform' && this.open) {
        if (this.type=='confirm') {
          this.btnSubmit.focus();
        }
        if (this.type=='pane') {
          this.btnClose.focus();
        }
        this.dispatchEvent(new CustomEvent('open'));
      }
    })
    this.addEventListener('transitionend',(ev) => {
      if (ev.propertyName === 'transform' && !this.open) {
        if (this.remove) {
          this.parentNode.removeChild(this);
          //document.body.removeChild(this);
        }
        this.dispatchEvent(new CustomEvent('close'));
      }
    })
    this.addEventListener('click', (ev) => {
      if (ev.target.closest('[autoclose]')) {
        this.open = false;
        window.rfActiveElement.focus();
      }
    })
    if (this.type) {
      this.btnClose.addEventListener('click', () => {
        this.open = false;
        window.rfActiveElement.focus();
      })
    }
    if (this.type=='confirm') {
      this.btnCancel.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('cancel'));
        this.open = false;
        window.rfActiveElement.focus();
      })
      this.btnSubmit.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('submit'));
        if (!this.loading) {
          this.open = false;
          window.rfActiveElement.focus();
        }
      })
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'open' && this.shadowRoot) {
      if (newValue==null && !this.stopfocus) {
        // window.rfActiveElement.focus();
      }
    }
    if (name == 'loading' && this.shadowRoot) {
      if (newValue !== null) {
        this.btnSubmit.loading = true;
      } else {
        this.btnSubmit.loading = false;
      }
    }
    if (name == 'title' && this.titles) {
      if (newValue !== null) {
        this.titles.innerHTML = newValue;
      }
    }
    if (name == 'oktext' && this.btnSubmit) {
      if (newValue !== null) {
        this.btnSubmit.innerHTML = newValue;
      }
    }
    if (name == 'canceltext' && this.btnCancel) {
      if (newValue !== null) {
        this.btnCancel.innerHTML = newValue;
      }
    }
  }

  get open() {
    return this.getAttribute('open') !== null;
  }
  set open(value) {
    if (value===null || value===false) {
      this.removeAttribute('open');
      this.parentNode.removeAttribute('open');
    } else {
      this.setAttribute('open', '');
      this.parentNode.setAttribute('open','');
      this.loading && (this.loading = false);
    }
  }

  get stopfocus() {
    return this.getAttribute('stopfocus') !== null;
  }

  get title() {
    return this.getAttribute('title') || '';
  }
  set title(value) {
    this.setAttribute('title', value);
  }

  get type() {
    return this.getAttribute('type');
  }
  set type(value) {
    if (value===null || value===false) {
      this.removeAttribute('type');
    } else {
      this.setAttribute('type', value);
    }
  }

  get oktext() {
    return this.getAttribute('oktext') || '确 定';
  }
  set oktext(value) {
    this.setAttribute('oktext', value);
  }

  get canceltext() {
    return this.getAttribute('canceltext') || '取 消';
  }
  set canceltext(value) {
    this.setAttribute('canceltext', value);
  }

  get loading() {
    return this.getAttribute('loading') !== null;
  }
  set loading(value) {
    if (value===null || value===false) {
      this.removeAttribute('loading');
    } else {
      this.setAttribute('loading', '');
    }
  }
}

if (!customElements.get('rf-popcon')) {
  customElements.define('rf-popcon', Popcon);
}