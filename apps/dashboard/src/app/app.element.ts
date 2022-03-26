import './app.element.scss';

export class AppElement extends HTMLElement {
  public static observedAttributes = [];

  connectedCallback() {
    this.innerHTML = `
   <p>dashboard works!</p>
      `;
  }
}
customElements.define('mfe-dashboard', AppElement);
