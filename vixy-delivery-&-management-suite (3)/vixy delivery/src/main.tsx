import React from 'react';
import ReactDOM from 'react-dom/client';
import { DeliveryProvider } from '../../src/context/DeliveryContext';
import { DriverApp } from '../../src/components/apps/DriverApp';
import '../../src/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DeliveryProvider>
      <div className="w-screen h-screen overflow-hidden bg-neutral-900">
        <DriverApp />
      </div>
    </DeliveryProvider>
  </React.StrictMode>
);
