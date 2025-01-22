import "./App.css";
import { BlindTest } from "./BlindTest";
import { PlaylistPicker } from "./PlaylistPicker";

import { useState } from "react";


function App() {
  const [blindtestReady, setBlindtestReady] = useState([]); // État pour le blindtest

  return (
    <div className="App">
      {/* Passer setBlindtestReady comme prop */}
      <PlaylistPicker setBlindtestReady={setBlindtestReady} blindtestReady={blindtestReady}  />
      {/* Passer blindtestReady comme prop */}
      <BlindTest blindtestReady={blindtestReady} />
    </div>
  );
}

export default App;

