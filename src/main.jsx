import React from "react"
import { ThemeProvider } from "./context/ThemeContext"
import { LangProvider } from "./context/LangContext"
import ReactDOM from "react-dom/client"
import "./index.css"
import Root from "./pages/Root"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LangProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </LangProvider>
  </React.StrictMode>
)
