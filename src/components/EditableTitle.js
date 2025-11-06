import React, { useState, useEffect } from 'react';
import { Typography, IconButton, InputBase, Box, useTheme } from '@mui/material';
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

const EditableTitle = ({ defaultTitle = 'Cozy Todo' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [tempTitle, setTempTitle] = useState(defaultTitle);
  const theme = useTheme();

  // Load saved title from localStorage on mount
  useEffect(() => {
    const savedTitle = localStorage.getItem('appTitle');
    if (savedTitle) {
      setTitle(savedTitle);
      setTempTitle(savedTitle);
    }
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setTempTitle(title);
  };

  const handleSave = () => {
    if (tempTitle.trim()) {
      setTitle(tempTitle);
      localStorage.setItem('appTitle', tempTitle);
    } else {
      setTempTitle(title);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(title);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        mb: 3,
        position: 'relative',
        '&:hover .edit-button': {
          opacity: 1,
        },
      }}
    >
      {isEditing ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.2)',
            borderRadius: 2,
            padding: '4px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <InputBase
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
            sx={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 700,
              color: 'primary.main',
              '& input': {
                textAlign: 'center',
                padding: '4px 0',
              },
            }}
          />
          <IconButton
            size="small"
            onClick={handleSave}
            sx={{ color: 'success.main' }}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleCancel}
            sx={{ color: 'error.main' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 700,
              color: 'primary.main',
              textAlign: 'center',
              cursor: 'default',
              transition: 'color 0.3s ease',
            }}
          >
            {title}
          </Typography>
          <IconButton
            className="edit-button"
            size="small"
            onClick={handleEditClick}
            sx={{
              opacity: 0,
              transition: 'opacity 0.3s ease',
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default EditableTitle;