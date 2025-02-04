import { useState } from "react";

export function PlaylistPicker({ setBlindtestReady, blindtestReady, playlistsNames, setPlaylistsNames, playlistOwner,
  setPlaylistOwner, showPlaylistPicker, setShowPlaylistPicker, setShowBlindtest, setShowScoreAdder, setShowAddPlayer,  }) {
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

    let allTracks = [];
    let offset = 0;
    let limit = 100;
    let total = 0;

    do {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch playlist tracks:', response.statusText);
        return [];
      }

      const data = await response.json();
      allTracks = allTracks.concat(data.items);
      offset += limit;
      total = data.total;
    } while (offset < total);

    return allTracks;
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
  const [tracks, setTracks] = useState([]);
  const [blindtest, setBlindtest] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // État de chargement

  // Fonction pour ajouter un lien de playlist
  const handleAddPlaylist = (event) => {
    setPlaylistLink(event.target.value);
  };

  // Fonction pour récupérer les informations de la playlist
  const handleButtonClick = async () => {
    if (!playlistLink) {
      console.error('Playlist link is empty');
      return;
    }

    setIsLoading(true); // Début du chargement
    const playlistId = playlistLink.split('/').pop().split('?')[0];

    // Fetch playlist name
    const fetchedName = await fetchPlaylistName(playlistId);
    if (!fetchedName) {
      console.error('Failed to fetch playlist name');
      setIsLoading(false); // Fin du chargement
      return;
    }

    setPlaylistsNames((prevNames) => [fetchedName, ...prevNames]);

    // Fetch playlist owner
    const fetchedOwner = await fetchPlaylistOwner(playlistId);
    if (!fetchedOwner) {
      console.error('Failed to fetch playlist owner');
      setIsLoading(false); // Fin du chargement
      return;
    }

    setPlaylistOwner((prevNames) => [fetchedOwner, ...prevNames]);

    // Fetch playlist tracks
    const fetchedTracks = await fetchPlaylistTracks(playlistId);
    if (!fetchedTracks) {
      console.error('Failed to fetch playlist tracks');
      setIsLoading(false); // Fin du chargement
      return;
    }

    const fetchedBlindtest = fetchedTracks.map(track => ({
      url: track.track.external_urls.spotify,
    }));

    setTracks((prevTracks) => [...prevTracks, ...fetchedTracks]);
    setBlindtest((prevBlindtest) => [...prevBlindtest, ...fetchedBlindtest]);
    const blindtestEntry = {
      owner: fetchedOwner,
      tracks: fetchedBlindtest
    };

    setBlindtest((prevBlindtest) => [...prevBlindtest, blindtestEntry]);
    console.log('Fetched blindtest:', blindtestEntry);

    // Clear the input field
    setPlaylistLink("");
    setIsLoading(false); // Fin du chargement
  };

  function shuffleArray(array) {
    const shuffledArray = [...array]; // Crée une copie pour ne pas modifier l'original
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Génère un index aléatoire
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Échange les éléments
    }
    return shuffledArray;
  }
  // Fonction pour mélanger la playlist
  /* const handleMergePlaylist = () => {

    const shuffledBlindtest = shuffleArray(blindtest);
    setBlindtestReady(shuffledBlindtest);
    console.log('Shuffled blindtest:', shuffledBlindtest);

    setShowPlaylistPicker(false);
    setShowAddPlayer(false);
    setShowBlindtest(true);
  }; */

  const handleMergeEasyPlaylist = () => {
    const mergedBlindtest = [];
    const uniqueTracks = new Set();
    const maxTracks = 50;
    let trackCount = 0;
    let attempts = 0;
    const maxAttempts = 1000; // Sécurité pour éviter une boucle infinie

    while (trackCount < maxTracks && attempts < maxAttempts) {
      for (const entry of blindtest) {
        if (trackCount >= maxTracks) break;
        if (!entry.tracks || entry.tracks.length === 0) continue;

        let foundNewTrack = false;
        let localAttempts = 0; // Pour éviter une boucle infinie dans une seule playlist

        while (!foundNewTrack && localAttempts < entry.tracks.length) {
          const randomTrackIndex = Math.floor(Math.random() * entry.tracks.length);
          const track = entry.tracks[randomTrackIndex];

          if (!track || !track.url) {
            localAttempts++;
            continue;
          }

          if (!uniqueTracks.has(track.url)) {
            // Ajouter le track et le marquer comme trouvé
            mergedBlindtest.push({ owner: entry.owner, track: track.url });
            uniqueTracks.add(track.url);
            trackCount++;
            foundNewTrack = true;
          }

          localAttempts++;
        }
      }
      attempts++;
    }

    const shuffledBlindtest = shuffleArray(mergedBlindtest);

    setBlindtestReady(shuffledBlindtest);
    console.log("Merged blindtest:", shuffledBlindtest);

    setShowPlaylistPicker(false);
    setShowAddPlayer(false);
    setShowBlindtest(true);
  };





  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleButtonClick();
    }
  };

  if (!showPlaylistPicker) {
    return null;
  }

  return (
    <div className="playlist-link">
      <h1>Playlist link</h1>
      <input type="text" value={playlistLink} onChange={handleAddPlaylist} placeholder="Playlist link" onKeyPress={handleKeyPress} />
      <button onClick={handleButtonClick}>Add Playlist</button>
      <div className="list-playlist">
        <ul>
          {playlistsNames && playlistsNames.slice(0, 6).map((name, index) => (
            <li key={index}>{name} - {playlistOwner[index]}</li>
          ))}

          {playlistsNames.length > 6 && (
            <li>... and {playlistsNames.length - 6} others</li>
          )}
        </ul>
      </div>
      <button className="merge" onClick={handleMergeEasyPlaylist} disabled={isLoading}>
        {isLoading ? `Adding songs` : "Merge Playlist"}
      </button>
    </div>
  );
}
