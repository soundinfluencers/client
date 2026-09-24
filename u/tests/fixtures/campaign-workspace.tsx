import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "../../src/contexts/AuthContext.tsx";
import { AiChat } from "../../src/widgets/ai-chat/ui/ai-chat.tsx";
import { useUser } from "../../src/store/get-user/index.ts";
import "react-toastify/dist/ReactToastify.css";
import "../../src/styles/_base.scss";

useUser.setState({ role: "client", user: null });
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
document.body.style.cssText = "margin:0;background:#f4f6fa;font-family:Arial,sans-serif;";
createRoot(document.getElementById("root")!).render(
  <BrowserRouter><QueryClientProvider client={queryClient}><AuthProvider><AiChat /><ToastContainer /></AuthProvider></QueryClientProvider></BrowserRouter>,
);
