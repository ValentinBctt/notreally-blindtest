import React, { useEffect, useRef, useState } from 'react';
import { handlePlay, handleNext } from './BlindTest';
import { RevealBot } from './Reveal'; // RevealBot est utilisé pour l'animation d'apparition
import { RevealPoint } from './Reveal'; // RevealPoint est utilisé pour l'animation de "+1"

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
  const [showPlusOne, setShowPlusOne] = useState({}); // État initial vide

  const handleShowPlusOne = (player) => {
    setShowPlusOne((prev) => ({
      ...prev,
      [player]: true, // Affiche "+1" uniquement pour ce joueur
    }));

    setTimeout(() => {
      setShowPlusOne((prev) => ({
        ...prev,
        [player]: false, // Cache après 1 seconde
      }));
    }, 1000);
  };

  const handleScoreChange = (player) => {
    const now = Date.now();

    if (!lastClickedRef.current[player] || now - lastClickedRef.current[player] > 25000) {
      setScores((prevScores) => ({
        ...prevScores,
        [player]: (prevScores[player] || 0) + 1,
      }));

      lastClickedRef.current[player] = now;
      handleShowPlusOne(player); // Affiche "+1" uniquement pour ce joueur
    } else {
      console.log("Trop rapide !");
    }
  };

  if (!showScoreAdder) {
    return null;
  }

  return (
    <RevealBot trigger={showScoreAdder} reverse={!showScoreAdder}>
      <div className="score-adder">
        <h1>Who guess first?</h1>
        <div className="all-players-score">
          {players.map((player) => (
            <button className="score" key={player} onClick={() => { handleScoreChange(player); }}>
              {player}
              {showPlusOne[player] && (
                <RevealPoint>
                  <p className='plus-one'>+1</p>
                </RevealPoint>
              )}
            </button>
          ))}
        </div>
      </div>
    </RevealBot>
  );
}
