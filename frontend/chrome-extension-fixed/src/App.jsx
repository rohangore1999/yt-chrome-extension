import { useEffect } from "react";
import Index from "./components/Index";
import "./App.css";

function App() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="App">
      <Index />
    </div>
  );
}

export default App;
