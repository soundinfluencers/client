import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/app/queryClient.ts";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import "./styles/_base.scss";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
            <NuqsAdapter>
                <App/>
            </NuqsAdapter>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
