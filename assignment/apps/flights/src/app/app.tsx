// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import { BrowserRouter } from 'react-router-dom';

import { Route, Link } from 'react-router-dom';
import { useState } from 'react';

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
  const [state, setState] = useState<{ date: string }[]>([]);
  const getFlights = () => {
    fetch('api/flights')
      .then((res) => res.json())
      .then((flights) => setState(flights));
  };

  return (
    <div id="container">
      <h1>Flights</h1>
      <div>
        <input className={styles['input']} type="text" placeholder="From" />
        <input className={styles['input']} type="text" placeholder="To" />
      </div>
      <div>
        <button onClick={() => getFlights()} className={styles['button']}>
          Search
        </button>
      </div>

      {state.length > 0 && (
        <ul>
          {state.map((s) => (
            <li>{s.date}</li>
          ))}
        </ul>
      )}
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
