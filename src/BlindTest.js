import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';

export const handlePlay = async ({ deviceId, blindtestReady, currentTrackIndex, accessToken }) => {
  if (!deviceId) {
    console.error("Le lecteur n'est pas encore prêt.");
    return;
  }

  const track = blindtestReady[currentTrackIndex];
  if (!track) {
    console.error("La piste n'est pas disponible.");
    return;
  }

  const trackUri = track.url.replace(
    "https://open.spotify.com/track/",
    "spotify:track:"
  );

  try {
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [trackUri] }),
    });
    console.log(`Lecture de la piste : ${trackUri}`);
  } catch (error) {
    console.error("Erreur lors de la lecture :", error);
  }
};

export const handleNext = (currentTrackIndex, setCurrentTrackIndex, blindtestReady, deviceId, accessToken) => {
  if (!blindtestReady || !Array.isArray(blindtestReady)) {
    console.error("blindtestReady n'est pas défini ou n'est pas un tableau.");
    return;
  }

  const nextIndex = (currentTrackIndex + 1) % blindtestReady.length;
  setCurrentTrackIndex(nextIndex);
  handlePlay({ deviceId, blindtestReady, currentTrackIndex: nextIndex, accessToken });
};

const getTrackDetails = async (trackId, accessToken) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch track details');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la piste :", error);
    return null;
  }
};

export function BlindTest({ blindtestReady, currentTrackIndex, setCurrentTrackIndex, playlistsNames, setPlaylistsNames, playlistOwner, setPlaylistOwner }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("spotify_access_token"));
  const [trackDetails, setTrackDetails] = useState(null);
  const togglePlayButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get("access_token");

    if (token) {
      setAccessToken(token);
      localStorage.setItem("spotify_access_token", token);
      window.history.pushState({}, null, window.location.pathname);
    } else if (!accessToken) {
      const authUrl = `https://accounts.spotify.com/authorize?client_id=4cab9bcc279f483da32c1e5b4bf4bde8&response_type=token&redirect_uri=http://localhost:3000/callback&scope=streaming%20user-read-playback-state%20user-modify-playback-state%20user-read-private`;
      window.location.href = authUrl;
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    // Définir la fonction globalement avant de charger le script
    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Blind Test Player",
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Player ready with Device ID:", device_id);
        setDeviceId(device_id);
        setIsInitialized(true);
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.error("Le lecteur est hors ligne. Device ID:", device_id);
      });

      spotifyPlayer.addListener("initialization_error", (error) => {
        console.error("Erreur d'initialisation du lecteur :", error);
      });

      spotifyPlayer.addListener("authentication_error", (error) => {
        console.error("Erreur d'authentification :", error);
      });

      spotifyPlayer.addListener("account_error", (error) => {
        console.error("Erreur de compte (Spotify Premium requis) :", error);
      });

      spotifyPlayer.addListener("player_state_changed", (state) => {
        console.log("État du lecteur :", state);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    // Charger dynamiquement le script Spotify SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (player) {
        player.disconnect();
      }
      delete window.onSpotifyWebPlaybackSDKReady; // Nettoyer la fonction globale
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [accessToken]);

  useEffect(() => {
    if (player && togglePlayButtonRef.current) {
      togglePlayButtonRef.current.onclick = () => {
        player.togglePlay();
      };
    }
  }, [player]);

  useEffect(() => {
    if (blindtestReady[currentTrackIndex]) {
      const trackId = blindtestReady[currentTrackIndex].url.split('/').pop();
      getTrackDetails(trackId, accessToken).then(details => {
        setTrackDetails(details);
      });
    }
  }, [currentTrackIndex, blindtestReady, accessToken]);

  const handleStart = () => {
    if (!deviceId) {
      console.error("Le lecteur n'est pas encore prêt.");
      return;
    }
    setHasStarted(true);
    handlePlay({ deviceId, blindtestReady, currentTrackIndex, accessToken });
  };

  useEffect(() => {
    // Lancer un timer de 30 secondes
    const timer = setTimeout(() => {
      handleNext(
        currentTrackIndex,
        setCurrentTrackIndex,
        blindtestReady,
        deviceId,
        accessToken
      );
    }, 30000);

    // Nettoyer le timer si le composant est démonté ou si le track change
    return () => clearTimeout(timer);
  }, [currentTrackIndex, blindtestReady, deviceId, accessToken]);


  return (
    <div className="blindtest">
      <h1>The song was</h1>

      {!hasStarted ? (
        <button onClick={handleStart}>Démarrer le Blind Test</button>
      ) : (
        <div>
          {isInitialized ? (
            <div>

              {trackDetails ? (
                  <div className="track-details ">
                <p>
                  <div className="cover">
                  <img src={trackDetails.album.images[0].url} alt="Album cover" style={{ width: '100px', height: '100px' }} />
                  </div>
                  <div classsName="track-info">
                  {trackDetails.name || "Inconnue"} - {" "}
                  <br />
                  {trackDetails.artists?.map(artist => artist.name).join(", ") || "Inconnus"}
                  </div>
                </p>
                  </div>
              ) : (
                <p>Chargement des détails de la piste...</p>
              )}
            </div>
          ) : (
            <p>Chargement du lecteur...</p>
          )}
        </div>
      )}
    </div>
  );
}
