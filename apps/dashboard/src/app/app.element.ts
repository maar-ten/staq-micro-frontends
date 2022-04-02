import { LitElement, html } from 'lit';

export class MFEDashboardElement extends LitElement {
  static properties = {
    count: { type: Number },
  };

  count = 0;

  protected render() {
    return html` <p>Dashboard works!</p> `;
  }
  private _increment() {
    this.count++;
  }
}

customElements.define('mfe-dashboard', MFEDashboardElement);
