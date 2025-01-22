import React from 'react';

export function BlindTest({ blindtestReady }) {
  return (
    <div>
      <h1>Blind Test</h1>
      <ul>
        {blindtestReady && blindtestReady.length > 0 ? (

            <iframe
              src={`https://open.spotify.com/embed/track/${blindtestReady[0].url.split('/').pop()}`}
              width="300"
              height="80"
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
            ></iframe>

        ) : (
          <li>No tracks available</li>
        )}
      </ul>
    </div>
  );
}
