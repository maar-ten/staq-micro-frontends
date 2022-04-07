import { LitElement, html } from 'lit';
import { authService } from '@mfe/auth-core';
import './current-weather.element';

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
        <h1>Welcome ${user}</h1>
        <mfe-current-weather></mfe-current-weather>
        <button type="button" class="btn btn-primary" @click=${this.logout}>
          Logout
        </button>
      `;
    }

    return html`<span>Welcome, please login <a href="/login">here</a>.</span>`;
  }

  private logout() {
    authService.logout();
    window.location.assign('/dashboard');
  }

  createRenderRoot() {
    /**
     * Render template without shadow DOM. Note that shadow DOM features like
     * encapsulated CSS and slots are unavailable.
     */
    return this;
  }
}

customElements.define('mfe-dashboard', MFEDashboardElement);
