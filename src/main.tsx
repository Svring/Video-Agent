import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import "allotment/dist/style.css";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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
