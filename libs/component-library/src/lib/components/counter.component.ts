import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('mfe-counter')
export class MFECounterElement extends LitElement {
  @property({ type: Number })
  count = 0;

  protected override render() {
    return html`
      <p><button @click="${this._increment}">Click Me!</button></p>
      <p>Click count: ${this.count}</p>
    `;
  }
  private _increment() {
    this.count++;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mfe-counter': MFECounterElement;
  }
}
