import { useState } from "react";

export function PlaylistPicker({ setBlindtestReady, blindtestReady }) {
  let accessToken = null;
  let tokenExpiryTime = null;

  

  // Fonction pour récupérer le jeton d'accès
  const fetchAccessToken = async () => {
    const currentTime = Date.now();
    if (accessToken && tokenExpiryTime > currentTime) {
      return accessToken;
    }

    const clientId = '4cab9bcc279f483da32c1e5b4bf4bde8'; // Remplacez par votre client ID
    const clientSecret = '680cf0ba73184ad39957188f582de497'; // Remplacez par votre client secret

    const credentials = btoa(`${clientId}:${clientSecret}`);
    console.log('Encoded credentials:', credentials);

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      console.error('Failed to fetch access token:', response.statusText);
      return null;
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiryTime = currentTime + 3600 * 1000; // 1 hour token expiry time

    return accessToken;
  };

  // Fonction pour récupérer les pistes d'une playlist
  const fetchPlaylistTracks = async (playlistId) => {
    const token = await fetchAccessToken();
    if (!token) {
      console.error('No access token available');
      return [];
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch playlist tracks:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.items;
  };

  // Fonction pour récupérer le nom de la playlist
  const fetchPlaylistName = async (playlistId) => {
    const accessToken = await fetchAccessToken();
    if (!accessToken) {
      console.error('No access token available');
      return null;
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Erreur lors de la récupération des détails de la playlist");
      return null;
    }

    const data = await response.json();
    return data.name;
  };

  // Fonction pour récupérer le propriétaire de la playlist
  const fetchPlaylistOwner = async (playlistId) => {
    const accessToken = await fetchAccessToken();
    if (!accessToken) {
      console.error('No access token available');
      return null;
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Erreur lors de la récupération des détails de la playlist");
      return null;
    }

    const data = await response.json();
    return data.owner.display_name;
  };

  const [playlistLink, setPlaylistLink] = useState("");
  const [playlistsNames, setPlaylistsNames] = useState([]);
  const [playlistOwner, setPlaylistOwner] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [blindtest, setBlindtest] = useState([]);

  // Fonction pour ajouter un lien de playlist
  const handleAddPlaylist = (event) => {
    setPlaylistLink(event.target.value);
  };

  // Fonction pour récupérer les informations de la playlist
  const handleButtonClick = async () => {
    const playlistId = playlistLink.split('/').pop().split('?')[0];

    // Fetch playlist name
    const fetchedName = await fetchPlaylistName(playlistId);
    if (!fetchedName) {
      console.error('Failed to fetch playlist name');
      return;
    }

    setPlaylistsNames((prevNames) => [...prevNames, fetchedName]);

    // Fetch playlist owner
    const fetchedOwner = await fetchPlaylistOwner(playlistId);
    if (!fetchedOwner) {
      console.error('Failed to fetch playlist owner');
      return;
    }

    setPlaylistOwner((prevNames) => [...prevNames, fetchedOwner]);

    // Fetch playlist tracks
    const fetchedTracks = await fetchPlaylistTracks(playlistId);
    if (!fetchedTracks) {
      console.error('Failed to fetch playlist tracks');
      return;
    }

    const fetchedBlindtest = fetchedTracks.map(track => ({
      url: track.track.external_urls.spotify,
    }));

    setTracks(fetchedTracks);
    setBlindtest(fetchedBlindtest);
    console.log('Fetched blindtest:', fetchedBlindtest);
  };

  // Fonction pour mélanger la playlist
  const handleMergePlaylist = () => {
    function shuffleArray(array) {
      const shuffledArray = [...array]; // Crée une copie pour ne pas modifier l'original
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Génère un index aléatoire
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Échange les éléments
      }
      return shuffledArray;
    }
    const shuffledBlindtest = shuffleArray(blindtest);
    setBlindtestReady(shuffledBlindtest);
    console.log('Shuffled blindtest:', shuffledBlindtest);
  };

  return (
    <div>
      <h1>Playlist link</h1>
      <input type="text" value={playlistLink} onChange={handleAddPlaylist} />
      <div className="list-playlist">
        <button onClick={handleButtonClick}>Fetch Playlist Tracks</button>
        <ul>
          {playlistsNames && playlistsNames.map((name, index) => (
            <li key={index}>{name} - {playlistOwner[index]}</li>
          ))}
        </ul>
      </div>
      <button onClick={handleMergePlaylist}>Merge Playlist</button>
    </div>
  );
}
