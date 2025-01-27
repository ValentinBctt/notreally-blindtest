import React, { useState } from 'react';

export function ScoreAdder({ players, scores, setScores }) {


  const handleScoreChange = (player) => {
    setScores((prevScores) => ({
      ...prevScores,
      [player]: prevScores[player] + 1,
    }));
  };

  return (
    <div>
      <h1>ScoreAdder</h1>
      {players.map((player) => (
        <button key={player} onClick={() => handleScoreChange(player)}>
          {player} {scores[player]}
        </button>
      ))}
    </div>
  );
}
