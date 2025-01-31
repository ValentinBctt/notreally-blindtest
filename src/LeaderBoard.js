
export function LeaderBoard({ players, scores, showLeaderBoard, setShowLeaderBoard, counterSongs }) {
  const sortedPlayers = [...players].sort((a, b) => scores[b] - scores[a]);

  if (!showLeaderBoard) {
    return null;
  }


  return (
    <div className="leaderboard">
      <h1>LeaderBoard</h1>
      <ul>
        {sortedPlayers.map((player) => (
          <li key={player} className="player">
            <span className="player-name">{player}</span>
            <span className="player-score">
              {scores[player] || 0} {scores[player] === 1 ? "pt" : "pts"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
