import React from 'react';
import ReactDOM from 'react-dom/client';
import { DeliveryProvider } from '../../src/context/DeliveryContext';
import { StoreApp } from '../../src/components/apps/StoreApp';
import '../../src/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DeliveryProvider>
      <div className="w-screen h-screen overflow-hidden bg-neutral-900">
        <StoreApp />
      </div>
    </DeliveryProvider>
  </React.StrictMode>
);
