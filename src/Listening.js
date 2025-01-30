export function Listening( { showListening, setShowListening }) {
  if (!showListening) {
    return null;}


  return (

    <>

      <div class="logo">
        <img src="assets/Disco.svg" alt="Disco" />
      </div>
      <div class="outer-circle"></div>
      <div class="outer-circle-2"></div>
    </>
  );
}
