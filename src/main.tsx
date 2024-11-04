import React from "react";
import ReactDOM from "react-dom/client";
import {NextUIProvider} from "@nextui-org/react";

import App from "./App";

import "./main.css";
import "allotment/dist/style.css";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </React.StrictMode>,
);
