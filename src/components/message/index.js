import messageStyle from 'inline!./src/components/message/index.css';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(messageStyle).then();

class Message extends HTMLElement {

  static get observedAttributes() { return ['type','icon'] }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <div class="message">
        <rf-icon id="message-type" class="message-type" size="16"></rf-icon>
        <rf-loading></rf-loading>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    this.remove = false;
    this.messageType = this.shadowRoot.getElementById('message-type');
    this.shadowRoot.addEventListener('transitionend',(ev) => {
      if (ev.propertyName === 'transform' && !this.show) {
        messageContent.removeChild(this);
        this.dispatchEvent(new CustomEvent('close'));
      }
    })
    this.type= this.type;
    this.clientWidth;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ( name == 'type' && this.messageType) {
      if (newValue !== null) {
        this.messageType.name = this.typeMap(newValue).name;
        this.messageType.color = this.typeMap(newValue).color;
      }
    }
    if (name == 'icon' && this.messageType) {
      if (newValue !== null) {
        this.messageType.name = newValue;
      }
    }
  }

  typeMap(type) {
    let name = '';
    let color = '';
    switch (type) {
      case 'info':
        name = 'info-circle-fill';
        color = 'var(--infoColor,#1890ff)';
        break;
      case 'success':
        name = 'check-circle-fill';
        color = 'var(--successColor,#52c41a)';
        break;
      case 'error':
        name = 'close-circle-fill';
        color = 'var(--errorColor,#f4615c)';
        break;
      case 'warning':
        name = 'warning-circle-fill';
        color = 'var(--waringColor,#faad14)';
        break;
      default:
        break;
    }
    return {
      name:name,
      color:color
    }
  }

  get show() {
    return this.getAttribute('show') !== null;
  }
  set show(value) {
    if (value===null || value===false) {
      this.removeAttribute('show');
    } else {
      this.setAttribute('show', '');
    }
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
  set type(value) {
    this.setAttribute('type', value);
  }
}

if(!customElements.get('rf-message')){
  customElements.define('rf-message', Message);
}

let messageContent = document.getElementById('message-content');
if (!messageContent) {
  messageContent = document.createElement('div');
  messageContent.id = 'message-content';
  messageContent.style='position:fixed; pointer-events:none; left:0; right:0; top:10px; z-index:51;';
  document.body.appendChild(messageContent);
}

export const rfMessage = {
  info: function(text='', duration, onclose) {
    const message = new Message();
    message.timer && clearTimeout(message.timer);
    messageContent.appendChild(message);
    message.type = 'info';
    message.textContent = text;
    message.show = true;
    message.onclose = onclose;
    message.timer = setTimeout(() => {
      message.show = false;
    }, duration || 3000);
    return message;
  },
  success: function(text='', duration, onclose) {
    const message = new Message();
    message.timer && clearTimeout(message.timer);
    messageContent.appendChild(message);
    message.type = 'success';
    message.textContent = text;
    message.show = true;
    message.onclose = onclose;
    message.timer = setTimeout(() => {
      message.show = false;
    }, duration || 3000);
    return message;
  },
  error: function(text='', duration, onclose) {
    const message = new Message();
    message.timer && clearTimeout(message.timer);
    messageContent.appendChild(message);
    message.type = 'error';
    message.textContent = text;
    message.show = true;
    message.onclose = onclose;
    message.timer = setTimeout(() => {
      message.show = false;
    }, duration || 3000);
    return message;
  },
  warning: function(text='', duration, onclose) {
    const message = new Message();
    message.timer && clearTimeout(message.timer);
    messageContent.appendChild(message);
    message.type = 'warning';
    message.textContent = text;
    message.show = true;
    message.onclose = onclose;
    message.timer = setTimeout(() => {
      message.show = false;
    }, duration || 3000);
    return message;
  },
  loading: function(text='', duration=0, onclose) {
    const message = new Message();
    message.timer && clearTimeout(message.timer);
    messageContent.appendChild(message);
    message.type = 'loading';
    message.textContent = text;
    message.show = true;
    message.onclose = onclose;
    if (duration !== 0) {
      message.timer = setTimeout(() => {
        message.show = false;
      }, duration || 3000);
    }
    return message;
  },
  show: function({text, duration, onclose, icon}) {
    const message = new Message();
    message.timer && clearTimeout(message.timer);
    messageContent.appendChild(message);
    message.icon = icon;
    message.textContent = text || '';
    message.show = true;
    message.onclose = onclose;
    if (duration !== 0) {
      message.timer = setTimeout(() => {
        message.show = false;
      },duration || 3000);
    }
    return message;
  }
}
window.rfMessage = rfMessage;