import React, { useEffect } from 'react';
import { useRef } from 'react';
import { handlePlay, handleNext} from './BlindTest';

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

  const lastClickedRef = useRef({});

  const handleScoreChange = (player) => {
    const now = Date.now();
    if (!lastClickedRef.current[player] || now - lastClickedRef.current[player] > 25000) {
      setScores((prevScores) => ({
        ...prevScores,
        [player]: (prevScores[player] || 0) + 1,
      }));
      lastClickedRef.current[player] = now;
    } else {
      console.log('Trop rapide !');
    }
  };




  if (!showScoreAdder) {
    return null;
  }

  return (
    <div className="score-adder">
      <h1>Who guess first ?</h1>
      <div className="all-players-score">
      {players.map((player) => (
        <button className="score" key={player} onClick={() => { handleScoreChange(player);  }}>
          {player}

        </button>
      ))}
      </div>
    </div>
  );
}
