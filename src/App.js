import "./App.css";
import { BlindTest } from "./BlindTest";
import { PlaylistPicker } from "./PlaylistPicker";
import { Callback } from "./Callback";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AddPlayer } from "./AddPlayer";
import { ScoreAdder } from "./ScoreAdder";
import { Listening } from "./Listening";

function App() {
  const [playlistsNames, setPlaylistsNames] = useState([]);
  const [playlistOwner, setPlaylistOwner] = useState([]);
  const [blindtestReady, setBlindtestReady] = useState([]); // État pour le blindtest
  const [players, setPlayers] = useState([]); // État pour les joueurs

  // Function to add a player with a limit of 9 players

  const [scores, setScores] = useState(
    players.reduce((acc, player) => {
      acc[player] = 0;
      return acc;
    }, {})
  );
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const [showAddPlayer, setShowAddPlayer] = useState(true);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(true);
  const [showScoreAdder, setShowScoreAdder] = useState(false);
  const [showBlindtest, setShowBlindtest] = useState(false);
  const [showListening, setShowListening] = useState(false);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/"
            element={
              <>
                <AddPlayer
                  showAddPlayer={showAddPlayer}
                  setShowAddPlayer={setShowAddPlayer}
                  players={players}
                  setPlayers={setPlayers}
                  scores={scores}
                  setScores={setScores}
                />

                {/* Passer setBlindtestReady comme prop */}
                <PlaylistPicker
                  showPlaylistPicker={showPlaylistPicker}
                  setShowPlaylistPicker={setShowPlaylistPicker}
                  setShowAddPlayer={setShowAddPlayer}
                  setShowScoreAdder={setShowScoreAdder}
                  setShowBlindtest={setShowBlindtest}
                  setShowListening={setShowListening}

                  setBlindtestReady={setBlindtestReady}
                  playlistsNames={playlistsNames}
                  setPlaylistsNames={setPlaylistsNames}
                  playlistOwner={playlistOwner}
                  setPlaylistOwner={setPlaylistOwner}
                />
                {/* Passer blindtestReady comme prop */}
                <BlindTest
                  showBlindtest={showBlindtest}
                  setShowBlindtest={setShowBlindtest}
                  setShowScoreAdder={setShowScoreAdder}
                  setShowListening={setShowListening}

                  
                  blindtestReady={blindtestReady}
                  currentTrackIndex={currentTrackIndex}
                  setCurrentTrackIndex={setCurrentTrackIndex}
                  playlistsNames={playlistsNames}
                  setPlaylistsNames={setPlaylistsNames}
                  playlistOwner={playlistOwner}
                  setPlaylistOwner={setPlaylistOwner}
                />
                <ScoreAdder
                  showScoreAdder={showScoreAdder}
                  setShowScoreAdder={setShowScoreAdder}
                  players={players}
                  currentTrackIndex={currentTrackIndex}
                  setCurrentTrackIndex={setCurrentTrackIndex}
                  blindtestReady={blindtestReady}
                  scores={scores}
                  setScores={setScores}
                />
                <Listening showListening={showListening} setShowListening={setShowListening}/>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
