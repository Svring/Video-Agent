import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import "allotment/dist/style.css";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import {NextUIProvider} from "@nextui-org/react";

import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </React.StrictMode>
);
