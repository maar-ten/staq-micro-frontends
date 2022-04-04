import { LitElement, html } from 'lit';
import { authService } from '@mfe/auth-core';

export class MFEDashboardElement extends LitElement {
  static properties = {
    count: { type: Number },
  };

  count = 0;

  protected render() {
    const isLoggedIn = authService.isLoggedIn();
    const user = authService.getUserName();

    if (isLoggedIn) {
      return html`
        <p>Welcome ${user}</p>
        <button @click=${this.logout}>Logout</button>
      `;
    }

    return html`<span>Welcome, please login <a href="/login">here</a>.</span>`;
  }

  private logout() {
    authService.logout();
    window.location.assign('/dashboard');
  }
}

customElements.define('mfe-dashboard', MFEDashboardElement);
