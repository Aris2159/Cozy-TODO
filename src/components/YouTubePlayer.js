import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Box, Alert, Collapse } from '@mui/material';

const YouTubePlayer = ({ url, volume, onError, playing }) => {
  const [player, setPlayer] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState(null);

  // Extract video ID from YouTube URL
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Update video ID when URL changes
  useEffect(() => {
    const newVideoId = getYoutubeVideoId(url);
    setVideoId(newVideoId);
    setError(null);

    // Cleanup previous player
    if (player) {
      try {
        player.pauseVideo();
      } catch (err) {
        console.error('Error pausing video:', err);
      }
    }
  }, [url, player]);

  // Update volume when it changes
  useEffect(() => {
    if (player) {
      try {
        player.setVolume(volume * 100);
      } catch (err) {
        console.error('Error setting volume:', err);
      }
    }
  }, [volume, player]);
  
  // Handle play/pause state changes
  useEffect(() => {
    if (player) {
      try {
        if (playing) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      } catch (err) {
        console.error('Error controlling video playback:', err);
      }
    }
  }, [playing, player]);

  const handleReady = (event) => {
    setPlayer(event.target);
    try {
      event.target.setVolume(volume * 100);
      event.target.playVideo();
    } catch (err) {
      console.error('Error in handleReady:', err);
      setError('Failed to initialize video playback');
    }
  };

  const handleError = (event) => {
    console.error('YouTube player error:', event.data);
    let errorMessage = 'An error occurred while playing the video';
    
    // YouTube API error codes
    switch (event.data) {
      case 2:
        errorMessage = 'Invalid YouTube URL';
        break;
      case 5:
        errorMessage = 'HTML5 player error';
        break;
      case 100:
        errorMessage = 'Video not found';
        break;
      case 101:
      case 150:
        errorMessage = 'Video playback not allowed';
        break;
      default:
        errorMessage = 'Failed to load video';
    }

    setError(errorMessage);
    if (onError) onError(errorMessage);
  };

  const handleStateChange = (event) => {
    // Auto-loop when video ends
    if (event.data === YouTube.PlayerState.ENDED) {
      try {
        event.target.playVideo();
      } catch (err) {
        console.error('Error restarting video:', err);
      }
    }
  };

  if (!videoId) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <Collapse in={!!error}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '& .MuiAlert-message': {
              fontFamily: 'Quicksand, sans-serif'
            }
          }}
        >
          {error}
        </Alert>
      </Collapse>
      
      <Box sx={{
        position: 'relative',
        paddingTop: '56.25%', // 16:9 aspect ratio
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        '& iframe': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 2
        }
      }}>
        <YouTube
          videoId={videoId}
          opts={{
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              controls: 1
            }
          }}
          onReady={handleReady}
          onError={handleError}
          onStateChange={handleStateChange}
        />
      </Box>
    </Box>
  );
};

export default YouTubePlayer;