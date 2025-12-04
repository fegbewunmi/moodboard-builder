import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-3xl text-emerald-400">
      Tailwind is working ✨
    </div>
  );
}

export default App;
