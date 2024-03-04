import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";

if (location.hostname !== "localhost") disableReactDevTools();
polyfillCountryFlagEmojis();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
)
