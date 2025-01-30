import React, { useEffect } from 'react';
import { handlePlay, handleNext } from './BlindTest';

export function ScoreAdder({ players, scores, setScores, currentTrackIndex, setCurrentTrackIndex, blindtestReady, deviceId, accessToken, showScoreAdder, setShowScoreAdder }) {

  useEffect(() => {
    // Initialiser les scores à 0 pour chaque joueur si ce n'est pas déjà fait
    const initialScores = {};
    players.forEach(player => {
      if (!scores[player]) {
        initialScores[player] = 0;
      }
    });
    setScores(prevScores => ({ ...prevScores, ...initialScores }));
  }, [players, setScores]);

  const handleScoreChange = (player) => {
    setScores((prevScores) => ({
      ...prevScores,
      [player]: (prevScores[player] || 0) + 1,
    }));
  };

  const handleNextTrack = () => {
    if (!deviceId) {
      console.error("Le lecteur n'est pas encore prêt.");
      return;
    }
    handleNext(currentTrackIndex, setCurrentTrackIndex, blindtestReady, deviceId, accessToken);
  };

  if (!showScoreAdder) {
    return null;
  }

  return (
    <div className="score-adder">
      <h1>Who's got the point ?</h1>
      {players.map((player) => (
        <button className="score" key={player} onClick={() => { handleScoreChange(player);  }}>
          {player} {scores[player] || 0}
        </button>
      ))}
    </div>
  );
}
