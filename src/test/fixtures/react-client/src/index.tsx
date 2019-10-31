import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./app/App";
// import registerServiceWorker from './registerServiceWorker';
import { CubaAppProvider } from "@cuba-platform/react";
import { HashRouter, Route } from "react-router-dom";
import { initializeApp } from "@cuba-platform/rest";
import { CUBA_APP_URL } from "./config";
import "antd/dist/antd.css";
import "./index.css";
export const cubaREST = initializeApp({
  name: "mpg",
  apiUrl: CUBA_APP_URL,
  storage: window.localStorage
});
ReactDOM.render(
  <CubaAppProvider cubaREST={cubaREST}>
    <HashRouter>
      <Route component={App} />
    </HashRouter>
  </CubaAppProvider>,
  document.getElementById("root") as HTMLElement
);
// registerServiceWorker();