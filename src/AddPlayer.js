import { useState } from "react";

export function AddPlayer({ players, setPlayers }) {
  const [newPlayer, setNewPlayer] = useState("");

  const handleAddPlayer = () => {
    if (newPlayer.trim() !== "") {
      setPlayers([...players, newPlayer]);
      setNewPlayer(""); // Réinitialiser le champ de saisie après l'ajout
    }
  };

  return (
    <div>
      <h1>Add Player</h1>
      <input
        type="text"
        value={newPlayer}
        placeholder="Player name"
        onChange={(e) => setNewPlayer(e.target.value)}
      />
      <button onClick={handleAddPlayer}>Add Player</button>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
    </div>
  );
}
