import { MFEDashboardElement } from './app.element';

describe('AppElement', () => {
  let app: MFEDashboardElement;

  beforeEach(() => {
    app = new MFEDashboardElement();
  });

  it('should create successfully', () => {
    expect(app).toBeTruthy();
  });

  it('should have a greeting', () => {
    app.connectedCallback();

    expect(app.querySelector('p').innerHTML).toContain('dashboard works!');
  });
});
