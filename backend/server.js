console.log("🚀 Le serveur démarre...");

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const SPOTIFY_API_URL = "https://api.spotify.com/v1";
let spotifyAccessToken = "";
let spotifyAccessTokenExpiry = 0; // Ajouter un champ pour l'expiration du token

// Fonction pour obtenir un token d'accès Spotify
const getSpotifyToken = async () => {
  try {
    console.log("🔑 Demande de token Spotify...");
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (response.data.access_token) {
      spotifyAccessToken = response.data.access_token;
      spotifyAccessTokenExpiry = Date.now() + (response.data.expires_in * 1000); // Expiration du token
      console.log("✅ Token Spotify obtenu");
    } else {
      console.error("❌ Impossible d'obtenir le token Spotify");
    }
  } catch (error) {
    console.error("Erreur lors de l'obtention du token Spotify", error);
  }
};

// Vérifier si le token est valide ou s'il faut le renouveler
const isSpotifyTokenValid = () => {
  console.log("🔍 Vérification du token Spotify...");
  return spotifyAccessToken && Date.now() < spotifyAccessTokenExpiry;
};

// 🔹 Récupérer les morceaux d'une playlist Deezer
app.get("/deezer/playlist/:id", async (req, res) => {
  console.log(`📥 Demande de playlist Deezer pour ID: ${req.params.id}`);
  try {
    const { id } = req.params;

    // Récupération de la playlist Deezer
    const deezerResponse = await axios.get(`https://api.deezer.com/playlist/${id}`);
    console.log("🎵 Playlist Deezer récupérée avec succès :", deezerResponse.data);

    if (!deezerResponse.data || !deezerResponse.data.tracks) {
      return res.status(404).json({ error: "Playlist Deezer introuvable" });
    }

    const tracks = deezerResponse.data.tracks?.data || [];  // Utiliser un tableau vide si pas de données
    const playlistTitle = deezerResponse.data.title;

    // Récupérer le token Spotify si nécessaire
    if (!isSpotifyTokenValid()) {
      console.log("🔑 Récupération du token Spotify...");
      await getSpotifyToken();
      if (!isSpotifyTokenValid()) {
        return res.status(500).json({ error: "Erreur Spotify : impossible de récupérer le token" });
      }
    }

    const spotifyLinks = [];

    for (const track of tracks) {
      const searchQuery = `${track.title} ${track.artist.name}`;
      console.log("🔎 Recherche Spotify pour :", searchQuery);

      try {
        const spotifyResponse = await axios.get(
          `${SPOTIFY_API_URL}/search`,
          {
            headers: { Authorization: `Bearer ${spotifyAccessToken}` },
            params: { q: searchQuery, type: "track", limit: 1 },
          }
        );

        if (spotifyResponse.data.tracks.items.length > 0) {
          const spotifyTrack = spotifyResponse.data.tracks.items[0];
          console.log("✅ Trouvé sur Spotify :", spotifyTrack.name);

          spotifyLinks.push({
            title: spotifyTrack.name,
            artist: spotifyTrack.artists.map(a => a.name).join(", "),
            spotify_url: `https://open.spotify.com/track/${spotifyTrack.id}`,
          });
        } else {
          console.log("❌ Aucun résultat Spotify pour :", searchQuery);
        }
      } catch (error) {
        console.error("⚠️ Erreur lors de la requête Spotify :", error.response?.data || error.message);
      }
    }

    if (spotifyLinks.length === 0) {
      console.log("❌ Aucune chanson trouvée sur Spotify");
      return res.status(404).json({ error: "Aucune chanson trouvée sur Spotify" });
    }

    res.json({
      playlistTitle: playlistTitle,
      tracks: spotifyLinks,
    });
  } catch (error) {
    console.error("💥 Erreur générale :", error.response?.data || error.message);
    res.status(500).json({ error: "Erreur lors du traitement de la playlist", details: error.message });
  }
});

app.listen(3001, () => {
  console.log("✅ Serveur backend lancé sur http://localhost:3001");
});
