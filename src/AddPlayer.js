import { useState } from "react";

export function AddPlayer({ players, setPlayers, showAddPlayer, setShowAddPlayer }) {
  const [newPlayer, setNewPlayer] = useState("");

  const addPlayer = (player) => {
    if (players.length < 6) {
      setPlayers([...players, player]);
    } else {
      alert("Maximum 6 players allowed");
    }
  };

  const handleAddPlayer = () => {
    if (newPlayer.trim() !== "") {
      if (newPlayer.length <= 8) {
        if (!players.includes(newPlayer)) {
          addPlayer(newPlayer);
          setNewPlayer(""); // Réinitialiser le champ de saisie après l'ajout
        } else {
          alert("Player name already exists");
        }
      } else {
        alert("Player name cannot exceed 8 letters");
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddPlayer();
    }
  };

  if (!showAddPlayer) {
    return null;
  }

  return (
    <div className="add-player">
      <h1>Add Player</h1>
      <input
        type="text"
        value={newPlayer}
        placeholder="Player name"
        onChange={(e) => setNewPlayer(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleAddPlayer}>+</button>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player} ,</li>
        ))}
      </ul>
    </div>
  );
}
