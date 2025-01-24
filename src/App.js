import "./App.css";
import { BlindTest } from "./BlindTest";
import { PlaylistPicker } from "./PlaylistPicker";
import { Callback } from "./Callback";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [blindtestReady, setBlindtestReady] = useState([]); // État pour le blindtest

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/callback" element={<Callback />} />
          <Route path="/" element={
            <>
              {/* Passer setBlindtestReady comme prop */}
              <PlaylistPicker setBlindtestReady={setBlindtestReady} />
              {/* Passer blindtestReady comme prop */}
              <BlindTest blindtestReady={blindtestReady} />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


