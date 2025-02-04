export function BlindtestCountdown({ currentTrackIndex }) {
  return (
    <div className="blindtest-countdown">
      <h2>{currentTrackIndex + 1} / 50</h2>
    </div>
  );
}
