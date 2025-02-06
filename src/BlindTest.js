import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { LeaderBoard } from "./LeaderBoard";
import { RevealTop } from "./Reveal";

const clientId = '4cab9bcc279f483da32c1e5b4bf4bde8'; // Remplacez par votre client ID


/* const redirectUri = process.env.NODE_ENV === 'production'
  ? 'https://shook-ones-ab7e5e2c1b17.herokuapp.com/callback'
  : 'http://localhost:3000/callback'; */

const redirectUri = 'https://shook-ones-ab7e5e2c1b17.herokuapp.com/callback'



const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=streaming%20user-read-playback-state%20user-modify-playback-state%20user-read-private`;

export const handlePlay = async ({ deviceId, blindtestReady, currentTrackIndex, accessToken }) => {
  if (!deviceId) {
    console.error("Le lecteur n'est pas encore prêt.");
    return;
  }

  const track = blindtestReady[currentTrackIndex];
  if (!track || !track.track) {
    console.error("La piste n'est pas disponible.");
    return;
  }

  const trackUri = track.track.replace(
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

export const handleNext = (currentTrackIndex, setCurrentTrackIndex, blindtestReady, deviceId, accessToken, counterSongs, setCounterSongs) => {
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

const refreshAccessToken = async (refreshToken) => {
  const clientId = '4cab9bcc279f483da32c1e5b4bf4bde8'; // Remplacez par votre client ID
  const clientSecret = '680cf0ba73184ad39957188f582de497'; // Remplacez par votre client secret

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
  });

  if (!response.ok) {
    console.error('Failed to refresh access token:', response.statusText);
    return null;
  }

  const data = await response.json();
  return data.access_token;
};

export function BlindTest({ blindtestReady, currentTrackIndex, setCurrentTrackIndex, playlistsNames,
  setPlaylistsNames, playlistOwner, setPlaylistOwner, showBlindtest, setShowScoreAdder,
   setShowListening, setCounterSongs, counterSongs, setShowLeaderBoard, setShowLogo }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("spotify_access_token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("spotify_refresh_token"));
  const [trackDetails, setTrackDetails] = useState(null);
  const togglePlayButtonRef = useRef(null);
  const navigate = useNavigate();
  const [showTrackDetails, setShowTrackDetails] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const handleCounterSongs = (counterSongs, setCounterSongs) => {
    setCounterSongs(counterSongs + 1);
  }

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (token && refreshToken) {
      setAccessToken(token);
      setRefreshToken(refreshToken);
      localStorage.setItem("spotify_access_token", token);
      localStorage.setItem("spotify_refresh_token", refreshToken);
      window.history.pushState({}, null, window.location.pathname);
    } else if (!accessToken) {
      window.location.href = authUrl;
    }
  }, [accessToken, refreshToken]);

  useEffect(() => {
    if (!accessToken && refreshToken) {
      refreshAccessToken(refreshToken).then(newAccessToken => {
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          localStorage.setItem("spotify_access_token", newAccessToken);
        }
      });
    }
  }, [refreshToken]);

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
        setIsPlaying(!state.paused);
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
      const trackId = blindtestReady[currentTrackIndex].track.split('/').pop();
      getTrackDetails(trackId, accessToken).then(details => {
        setTrackDetails(details);
      });
    }
  }, [currentTrackIndex, blindtestReady, accessToken]);

  const handleStart = async () => {
    console.log("🔹 Bouton Start cliqué !");

    if (!player) {
      console.error("❌ Le lecteur Spotify n'est pas prêt.");
      alert("Le lecteur Spotify n'est pas encore prêt. Veuillez patienter.");
      return;
    }

    console.log("🎧 Connexion au lecteur...");
    const isConnected = await player.connect();
    console.log("✅ Lecteur connecté :", isConnected);

    if (!isConnected) {
      console.error("❌ Impossible de connecter le lecteur.");
      alert("Connexion au lecteur Spotify impossible. Vérifiez que Spotify est ouvert.");
      return;
    }

    console.log("📡 Sélection du device ID :", deviceId);
    if (!deviceId) {
      console.error("❌ Aucun device ID disponible.");
      alert("Le lecteur Spotify n'est pas disponible. Attendez quelques secondes et réessayez.");
      return;
    }

    try {
      console.log("▶️ Tentative de lecture...");
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [blindtestReady[currentTrackIndex].track.replace("https://open.spotify.com/track/", "spotify:track:")] }),
      });
      console.log("🎵 Lecture démarrée !");
    } catch (error) {
      console.error("❌ Erreur lors du démarrage de la lecture :", error);
      alert("Erreur lors du démarrage de la lecture. Vérifiez votre connexion.");
    }

    setHasStarted(true);
    setShowListening(true);
    handleIsPlaying();

  };



  useEffect(() => {
    // Lancer un timer de 30 secondes si la musique est en lecture
    if (counterSongs === 5 && isPlaying) {
      const timerLeaderBoard = setTimeout(() => {
        handleNext(
          currentTrackIndex,
          setCurrentTrackIndex,
          blindtestReady,
          deviceId,
          accessToken
        );
      }, 42000);
      return () => clearTimeout(timerLeaderBoard);
    }

    if (isPlaying) {
      const timer = setTimeout(() => {
        handleNext(
          currentTrackIndex,
          setCurrentTrackIndex,
          blindtestReady,
          deviceId,
          accessToken
        );
        handleCounterSongs(counterSongs, setCounterSongs);
      }, 35000);

      // Nettoyer le timer si le composant est démonté ou si le track change
      return () => clearTimeout(timer);

    }
  }, [currentTrackIndex, setCurrentTrackIndex, blindtestReady, deviceId, accessToken, isPlaying]);

  useEffect(() => {

    if (counterSongs === 5 && isPlaying) {
      if (isPlaying) {
        const timerTrackDetails = setTimeout(() => {
          setShowTrackDetails(true);
          setShowScoreAdder(true);
        }, 20000);

        const timerTrackDetailsHide = setTimeout(() => {
          setShowTrackDetails(false);
          setShowScoreAdder(false);
        }, 35000); // 20000 + 14000

        const timerLeaderBoard = setTimeout(() => {
          setShowLeaderBoard(true);
        }, 35000);

        const timerLeaderBoardHide = setTimeout(() => {
          setShowLeaderBoard(false);
        }, 42000); // 35000 + 15000

        return () => {
          clearTimeout(timerTrackDetails);
          clearTimeout(timerTrackDetailsHide);
          clearTimeout(timerLeaderBoard);
          clearTimeout(timerLeaderBoardHide);
          setCounterSongs(0);
          handleNext()
        };
      }
  }

    if (isPlaying) {
      const timerTrackDetails = setTimeout(() => {
        setShowTrackDetails(true);
        setShowScoreAdder(true);
      }, 20000);

      const timerTrackDetailsHide = setTimeout(() => {
        setShowTrackDetails(false);
        setShowScoreAdder(false);
      }, 35000); // 20000 + 14000

      return () => {
        clearTimeout(timerTrackDetails);
        clearTimeout(timerTrackDetailsHide);
      };
    }
  }, [isPlaying, currentTrackIndex, setShowTrackDetails, setShowScoreAdder, counterSongs, setCounterSongs, setIsPlaying]);

  const handleIsPlaying = () => {
    setIsPlaying(true);
  };

  const handleShowLogo = () => {
    setShowLogo(false);
  }

  if (!showBlindtest) {
    return null;
  }

  return (
    <div className="gradient">
      <div className="blindtest">
        {!hasStarted ? (
          <div>


            <button
  className="start"

  onClick={async () => {

    console.log("Device ID actuel :", deviceId);

    // Vérifie si le lecteur est prêt
    if (!deviceId) {
      alert("Le lecteur Spotify n'est pas prêt. Attendez quelques secondes puis réessayez.");
      return;
    }

    // Vérifie si l'access token est valide
    if (!accessToken) {
      console.log("Access Token expiré ou inexistant, tentative de rafraîchissement...");
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (!newAccessToken) {
        alert("Impossible d'obtenir un nouvel access token. Essayez de vous reconnecter.");
        return;
      }
      setAccessToken(newAccessToken);
      localStorage.setItem("spotify_access_token", newAccessToken);
    }

    // Petit délai avant de lancer la musique (pour éviter les erreurs sur mobile)
    setTimeout(() => {
      handleStart();
      handleIsPlaying();
      handleShowLogo();
    }, 500);
  }}
>
  Start Blind Test
</button>

            <p>If it doesn't work, clear your cookies and refresh the page</p>
          </div>
        ) : (
          <div>
            {isInitialized ? (
              <div>
                {trackDetails ? (
                  !showTrackDetails ? (
                    null
                  ) : (
                    <RevealTop trigger={showTrackDetails} reverse={!showTrackDetails}>
                    <div className="track-details">
                      <h1>The song was from</h1>
                        <div className="playlist-owner">
                          <p>{blindtestReady[currentTrackIndex]?.owner || "Unknown Owner"}</p>
                        </div>
                      <div className="cover">
                        <img src={trackDetails.album.images[0].url} alt="Album cover" style={{ width: '120px', height: '120px', margin: '0.5rem', borderRadius: '10px' }} />
                      </div>

                      <div className="track-info">
                        <div className={trackDetails.name.length > 20 ? "marquee" : ""}>
                          <p>
                            {trackDetails.name || "Inconnue"}{" "} - {" "}
                          </p>
                        </div>
                          <div className={trackDetails.artists.map(artist => artist.name).join(", ").length > 20 ? "marquee" : ""}>
                          <p>
                            {trackDetails.artists?.map(artist => artist.name).join(", ") || "Inconnus"}
                          </p>
                          </div>
                        </div>
                      </div>
                      </RevealTop>
                  )
                ) : (
                  { handleNext }
                )}
              </div>
            ) : (
              <p>Chargement du lecteur...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
