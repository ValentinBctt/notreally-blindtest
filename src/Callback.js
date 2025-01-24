import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');

    if (accessToken) {
      localStorage.setItem('spotify_access_token', accessToken);
      navigate('/');
    }
  }, [navigate]);

  return <div>Loading...</div>;
}
