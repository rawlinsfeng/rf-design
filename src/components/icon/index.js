import iconStyle from 'inline!./src/components/icon/index.css';
import { iconPathList } from './path.js';

const sheetObj = new CSSStyleSheet();
sheetObj.replace(iconStyle).then();

export default class Icon extends HTMLElement {
  static get observedAttributes() { return ['name','size','color','path'] }

  constructor() {
    super();
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheetObj];
    shadowRoot.innerHTML = `
      <svg class="icon" id="icon" aria-hidden="true" viewBox="0 0 ${this.view} ${this.view}">
        ${this.path ? '<path id="path"></path>' : '<path id="use"></path>'}
      </svg>
    `;
    this.icon = this.shadowRoot.getElementById('icon');
    this.use = this.icon.querySelector('use');
    this.d = this.icon.querySelector('path');
    this.size && (this.size = this.size);
    this.color && (this.color = this.color);
    this.name && (this.name = this.name);
    this.path && (this.path = this.path);
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if( name == 'name' && this.d){
      // this.use.setAttributeNS('http://www.w3.org/2000/xlink', 'href', `./icon.svg#icon-${newValue}`);
      const pathDValue = iconPathList.find(item => item.name === newValue);
      if (pathDValue && pathDValue.pathDList && pathDValue.pathDList.length) {
        let nodeContent = '';
        pathDValue.pathDList.forEach(item => {
          nodeContent += `<path d="${item}"></path>`;
        })
        this.shadowRoot.firstElementChild.innerHTML = nodeContent;
      }
    }
    if( name == 'path' && this.d){
      this.d.setAttribute("d", newValue);
    }
    if( name == 'color' && this.icon){
      this.icon.style.color = newValue;
    }
    if( name == 'size' && this.icon){
      this.icon.style.fontSize = newValue + 'px';
    }
  }

  get view() {
    return this.getAttribute('view') || 1024;
  }

  get name() {
    return this.getAttribute('name');
  }
  set name(value) {
    this.setAttribute('name', value);
  }

  get path() {
    return this.getAttribute('path') || '';
  }
  set path(value) {
    this.setAttribute('path', value);
  }

  get size() {
    return this.getAttribute('size') || '';
  }
  set size(value) {
    this.setAttribute('size', value);
  }

  get color() {
    return this.getAttribute('color') || '';
  }
  set color(value) {
    this.setAttribute('color', value);
  }
}

if(!customElements.get('rf-icon')){
  customElements.define('rf-icon', Icon);
}