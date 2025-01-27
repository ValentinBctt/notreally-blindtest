import "./App.css";
import { BlindTest } from "./BlindTest";
import { PlaylistPicker } from "./PlaylistPicker";
import { Callback } from "./Callback";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AddPlayer } from "./AddPlayer";
import { ScoreAdder } from "./ScoreAdder";

function App() {
  const [blindtestReady, setBlindtestReady] = useState([]); // État pour le blindtest
  const [players, setPlayers] = useState([]); // État pour les joueurs
  const [scores, setScores] = useState(players.reduce((acc, player) => {
    acc[player] = 0;
    return acc;
  }, {}));

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/"
            element={
              <>
                <AddPlayer players={players} setPlayers={setPlayers} scores={scores} setScores={setScores} />
                <ScoreAdder players={players} />
                {/* Passer setBlindtestReady comme prop */}
                <PlaylistPicker setBlindtestReady={setBlindtestReady} />
                {/* Passer blindtestReady comme prop */}
                <BlindTest blindtestReady={blindtestReady} />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
