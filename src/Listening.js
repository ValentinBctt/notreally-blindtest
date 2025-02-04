export function Listening( { showListening, setShowListening }) {
  if (!showListening) {
    return null;}


  return (

    <>
      <div className="listening">
        <img src="assets/Platine.svg" alt="Platine" className="platine"/>
      <div class="logo">

        <img src="assets/Vynil.svg" alt="Disco" className="vynil"/>
      </div>
      <div class="outer-circle"></div>
      <div class="outer-circle-2"></div>
      </div>
    </>
  );
}
