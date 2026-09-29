import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { store } from './redux/store';
import App from './App';
import './styles/tailwind.css';
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#181B15',
              color: '#FAF8F3',
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
