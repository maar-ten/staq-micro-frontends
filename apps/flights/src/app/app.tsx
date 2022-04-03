// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import { BrowserRouter } from 'react-router-dom';

import { Route, Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      <h1>Welcome!</h1>

      <p>
        <Link to="/search">Search flights.</Link>
      </p>
    </>
  );
}

export function Search() {
  return (
    <div id="container">
      <h1>Flights</h1>
      <div>
        <input className={styles['input']} type="text" placeholder="From" />
        <input className={styles['input']} type="text" placeholder="To" />
      </div>
      <div>
        <button className={styles['button']}>Search</button>
      </div>
    </div>
  );
}

export function App(props: { rootUrl: string }) {
  return (
    <BrowserRouter basename={props.rootUrl}>
      <Route path="/" exact render={() => <Home />} />
      <Route path="/search" exact render={() => <Search />} />
    </BrowserRouter>
  );
}

export default App;
