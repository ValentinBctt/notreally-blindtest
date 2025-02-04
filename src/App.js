import "./App.css";
import { BlindTest } from "./BlindTest";
import { PlaylistPicker } from "./PlaylistPicker";
import { Callback } from "./Callback";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AddPlayer } from "./AddPlayer";
import { ScoreAdder } from "./ScoreAdder";
import { Listening } from "./Listening";
import { LeaderBoard } from "./LeaderBoard";
import { PlaylistConverter } from "./PlaylistConverter";
import { BlindtestCountdown } from "./BlindtestCountdown";

function App() {
  const [playlistsNames, setPlaylistsNames] = useState([]);
  const [playlistOwner, setPlaylistOwner] = useState([]);
  const [blindtestReady, setBlindtestReady] = useState([]); // État pour le blindtest
  const [players, setPlayers] = useState([]); // État pour les joueurs
  const [counterSongs, setCounterSongs] = useState(1); // État pour le compteur de chansons
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
  const [showLeaderBoard, setShowLeaderBoard] = useState(false);
  const [showLogo, setShowLogo] = useState(true);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/"
            element={
              <>
                <Logo showLogo={showLogo} />
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
                  setShowLeaderBoard={setShowLeaderBoard}
                  setShowLogo={setShowLogo}
                  blindtestReady={blindtestReady}
                  currentTrackIndex={currentTrackIndex}
                  setCurrentTrackIndex={setCurrentTrackIndex}
                  playlistsNames={playlistsNames}
                  setPlaylistsNames={setPlaylistsNames}
                  playlistOwner={playlistOwner}
                  setPlaylistOwner={setPlaylistOwner}
                  counterSongs={counterSongs}
                  setCounterSongs={setCounterSongs}
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
                <Listening
                  showListening={showListening}
                  setShowListening={setShowListening}
                  currentTrackIndex={currentTrackIndex}
                />
                <LeaderBoard
                  players={players}
                  scores={scores}
                  showLeaderBoard={showLeaderBoard}
                  setShowLeaderBoard={setShowLeaderBoard}
                  counterSongs={counterSongs}
                />

              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

function Logo({ showLogo }) {
  if (!showLogo) {
    return null;
  }

  return (
    <img
      src="assets/Shook Ones Logo.svg"
      alt="Shook Ones Logo"
      className="SO-logo"
    />
  );
}
