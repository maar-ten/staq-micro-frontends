import { LitElement, html } from 'lit';

export class MFEButtonElement extends LitElement {
  static properties = {
    buttonText: { type: String },
  };

  text = 'Push me!';

  protected render() {
    return html`<button>${this.text}</button>`;
  }
}

customElements.define('mfe-button', MFEButtonElement);

declare global {
  interface HTMLElementTagNameMap {
    'mfe-button': MFEButtonElement;
  }
}
