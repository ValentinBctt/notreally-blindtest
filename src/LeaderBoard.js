
import { RevealTop } from "./Reveal";

export function LeaderBoard({ players, scores, showLeaderBoard, setShowLeaderBoard, counterSongs }) {
  const sortedPlayers = [...players].sort((a, b) => scores[b] - scores[a]);

  if (!showLeaderBoard) {
    return null;
  }

  return (


    <div className="leaderboard">
      <h1>LeaderBoard</h1>
      <ol>
        {sortedPlayers.map((player, index) => (
          <li key={player} className="player">
            <span className="player-rank">{index + 1 === 1 ? "🥇" : index + 1 === 2 ? "🥈" : index + 1 === 3 ? "🥉" : `${index + 1}.`}  </span>
            <span className="player-name">{player}</span>
            <span className="player-score">
              {scores[player] || 0} {scores[player] === 1 || scores[player] === 0 ? "pt" : "pts"}
            </span>
          </li>
        ))}
      </ol>
    </div>
    
  );
}
