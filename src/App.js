import React, { useState, useEffect, useRef } from 'react';
import EditableTitle from './components/EditableTitle';
import { Container, Typography, Box, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper, Switch, Slider, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete as DeleteIcon, Check as CheckIcon, Timer as TimerIcon, MusicNote as MusicIcon, Brightness4 as ThemeIcon, PlayArrow as PlayIcon, Pause as PauseIcon, Stop as StopIcon, LinkedIn as LinkedInIcon, GitHub as GitHubIcon, LocalCafe as CafeIcon, Forum as DiscordIcon, Settings as SettingsIcon } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@fontsource/quicksand';

const createCustomTheme = (mode, color) => createTheme({
  typography: {
    fontFamily: 'Quicksand, sans-serif',
  },
  palette: {
    mode,
    primary: {
      main: color,
    },
    background: {
      default: mode === 'light' ? '#f8f9fa' : '#1a1a1a',
      paper: mode === 'light' ? '#ffffff' : '#2d2d2d',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '15px',
            '&:hover fieldset': {
              borderColor: color,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

const themePresets = {
  purple: '#7c4dff',
  blue: '#2196f3',
  green: '#4caf50',
  pink: '#e91e63',
  orange: '#ff9800',
  teal: '#009688'
};

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timer, setTimer] = useState(25 * 60);
  const [customTimer, setCustomTimer] = useState(25);
  const [useTimer, setUseTimer] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerEndPopupOpen, setIsTimerEndPopupOpen] = useState(false);
  const [customThemeColor, setCustomThemeColor] = useState(themePresets.purple);
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('/images/default-bg.jpg');
  const [soundSource, setSoundSource] = useState('default');
  const [selectedSound, setSelectedSound] = useState('nature');
  const [customSound, setCustomSound] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedBackground = localStorage.getItem('background');
    
    if (savedTheme) setSelectedTheme(savedTheme);
    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
    if (savedBackground) setBackgroundImage(savedBackground);
  }, []);

const defaultSounds = {
  nature: '/sounds/nature.mp3',
  rain: '/sounds/rain.mp3',
  cafe: '/sounds/cafe.mp3',
  ocean: '/sounds/ocean.mp3',
  timerEnd: '/sounds/timerEnd.mp3'
};

const audioRef = useRef(null);
const timerAudioRef = useRef(new Audio(defaultSounds.timerEnd));
const taskAudioRef = useRef(new Audio(defaultSounds.timerEnd));
const alarmAudioRef = useRef(null);

// Safely play audio without throwing if interrupted by pause()
const safePlay = (audio) => {
  if (!audio) return;
  const p = audio.play();
  if (p && typeof p.catch === 'function') {
    p.catch(() => {});
  }
};

// Audio handling function

const handleDefaultSoundChange = (event) => {
  const newSound = event.target.value;
  setSelectedSound(newSound);
  if (soundSource === 'default') {
    const wasPlaying = isPlaying;
    audioRef.current?.pause();
    audioRef.current = new Audio(defaultSounds[newSound]);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    // Auto-play the sound safely
    safePlay(audioRef.current);
    setIsPlaying(true);
  }
};

const handleBackgroundChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => setBackgroundImage(e.target.result);
    reader.readAsDataURL(file);
  }
};

const handleSoundSourceChange = (event) => {
  const source = event.target.value;
  setSoundSource(source);
  
  // Stop any currently playing audio
  if (audioRef.current) {
    audioRef.current.pause();
  }
  
  if (source === 'default') {
    audioRef.current = new Audio(defaultSounds[selectedSound]);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    // Auto-play the sound safely
    safePlay(audioRef.current);
    setIsPlaying(true);
  } else if (source === 'custom' && customSound) {
    audioRef.current = new Audio(customSound);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    // Auto-play the sound safely
    safePlay(audioRef.current);
    setIsPlaying(true);
  } else if (source === 'none') {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }
};

const toggleSettings = () => {
  setIsSettingsOpen(!isSettingsOpen);
  // Don't stop playback when closing settings
  if (isSettingsOpen && isPlaying) {
    if ((soundSource === 'default' || soundSource === 'custom') && audioRef.current) {
      safePlay(audioRef.current);
    }
  }
};

  useEffect(() => {
    if (soundSource === 'default' && audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (timerAudioRef.current) timerAudioRef.current.pause();
      if (taskAudioRef.current) taskAudioRef.current.pause();
    };
  }, [soundSource]);

  useEffect(() => {
    if (soundSource === 'default' || soundSource === 'custom') {
      if (audioRef.current) audioRef.current.volume = volume;
      if (timerAudioRef.current) timerAudioRef.current.volume = volume;
      if (taskAudioRef.current) taskAudioRef.current.volume = volume;
    }
  }, [volume, soundSource]);

  useEffect(() => {
    alarmAudioRef.current = new Audio('/sounds/timerEnd.mp3');
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
        interval = setInterval(() => {
          setTimer((prevTimer) => prevTimer - 1);
        }, 1000);
      } else if (timer === 0) {
        setIsTimerRunning(false);
        // Play timer end sound
        if (alarmAudioRef.current) {
          alarmAudioRef.current.play();
        }
        setIsTimerEndPopupOpen(true);
      }
      return () => clearInterval(interval);
  }, [isTimerRunning, timer, alarmAudioRef]);

  // Autoplay background sound on startup with fallback after user interaction
  useEffect(() => {
    if (!audioRef.current) {
      if (soundSource === 'default') {
        audioRef.current = new Audio(defaultSounds[selectedSound]);
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
        safePlay(audioRef.current);
        setIsPlaying(true);
      } else if (soundSource === 'custom' && customSound) {
        audioRef.current = new Audio(customSound);
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
        safePlay(audioRef.current);
        setIsPlaying(true);
      }
    }
    const onFirstClick = () => {
      if (!isPlaying && audioRef.current) {
        safePlay(audioRef.current);
        setIsPlaying(true);
      }
      document.removeEventListener('click', onFirstClick);
    };
    document.addEventListener('click', onFirstClick);
    return () => document.removeEventListener('click', onFirstClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([...todos, { text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  const handleToggleComplete = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
    // Do not play any sound when a task is finished per request
  };

  const handleDeleteTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setTimer(customTimer * 60);
    setIsTimerRunning(false);
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  };

  const handleCustomTimerChange = (event) => {
    const value = parseInt(event.target.value) || 0;
    setCustomTimer(value);
    setTimer(value * 60);
  };

  const handleCloseTimerEndPopup = () => {
    setIsTimerEndPopupOpen(false);
    resetTimer();
  };

  const handleAddMinute = () => {
    setTimer((prevTimer) => prevTimer + 60);
    setIsTimerEndPopupOpen(false);
    setIsTimerRunning(true);
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setIsTimerEndPopupOpen(false);
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  };

  const handleThemeColorChange = (event) => {
    const color = event.target.value;
    if (color.startsWith('#')) {
      setCustomThemeColor(color);
      setSelectedTheme('custom');
    } else {
      setCustomThemeColor(themePresets[color]);
      setSelectedTheme(color);
    }
  };

  const handleVolumeChange = (_, newValue) => {
    setVolume(newValue);
  };

  const toggleMusic = () => {
    if ((soundSource === 'default' || soundSource === 'custom') && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        safePlay(audioRef.current);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCustomSoundUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const soundUrl = e.target.result;
        setCustomSound(soundUrl);
        setSoundSource('custom');
        
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        // Play the new custom sound safely
        audioRef.current = new Audio(soundUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
        safePlay(audioRef.current);
        setIsPlaying(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSoundChange = (event) => {
    setSelectedSound(event.target.value);
  };

  // Removed Logo component in favor of EditableTitle

  return (
    <ThemeProvider theme={createCustomTheme(isDarkMode ? 'dark' : 'light', customThemeColor)}>
      <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'background.default',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          overflow: 'auto',
          py: 4,
        }}>
        <Container maxWidth="xs" sx={{ 
              position: 'relative', 
              zIndex: 1,
              backgroundColor: theme => theme.palette.mode === 'light' 
                ? 'rgba(255,255,255,0.85)' 
                : 'rgba(45,45,45,0.85)',
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              boxShadow: theme => theme.palette.mode === 'light'
                ? '0 8px 32px rgba(0,0,0,0.1)'
                : '0 8px 32px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: theme => theme.palette.mode === 'light'
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.1)',
              '& > *:not(:last-child)': {
                mb: 2
              }
            }}>
            
            {/* Title Section */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <EditableTitle />
            </Box>
            
            {/* Theme Controls Section */}
            <Paper elevation={2} sx={{ p: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Left: Icon outside, Switch inside */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ThemeIcon color="primary" fontSize="small" />
                  <Switch checked={isDarkMode} onChange={toggleTheme} size="small" />
                </Box>
                {/* Right: Theme dropdown and color swatch stacked */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <FormControl size="small" sx={{ width: '120px' }}>
                    <Select
                      value={selectedTheme}
                      onChange={handleThemeColorChange}
                      displayEmpty
                      sx={{ fontSize: '0.8rem' }}
                    >
                      {Object.entries(themePresets).map(([name, color]) => (
                        <MenuItem key={name} value={name} sx={{ fontSize: '0.8rem' }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: color,
                              mr: 1,
                              display: 'inline-block'
                            }}
                          />
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'color';
                        input.value = customThemeColor;
                        input.onchange = (e) => handleThemeColorChange(e);
                        input.click();
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '2px solid',
                        borderColor: customThemeColor,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: customThemeColor,
                        marginTop: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>

          {/* Timer & Music Controls Section */}
          <Paper elevation={3} sx={{ p: 2, mb: 2, transition: 'all 0.3s ease' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TimerIcon color="primary" />
                <Switch
                  checked={useTimer}
                  onChange={(e) => setUseTimer(e.target.checked)}
                  color="primary"
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Use Timer
                </Typography>
              </Box>
              <IconButton onClick={toggleSettings} size="small">
                <SettingsIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Timer Controls */}
              {useTimer && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: { xs: 'stretch', sm: 'center' }, 
                  gap: 1.5 
                }}>
                  <TextField
                    type="number"
                    value={customTimer}
                    onChange={handleCustomTimerChange}
                    label="Minutes"
                    size="small"
                    inputProps={{ min: 1 }}
                    sx={{ width: { xs: '100%', sm: '100px' } }}
                  />
                  <Typography variant="h6" sx={{ 
                    flex: 1, 
                    color: 'primary.main',
                    textAlign: { xs: 'center', sm: 'left' },
                    py: { xs: 1, sm: 0 }
                  }}>
                    {formatTime(timer)}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    flexWrap: 'wrap'
                  }}>
                    <Button
                      variant="outlined"
                      onClick={toggleTimer}
                      startIcon={isTimerRunning ? <PauseIcon /> : <PlayIcon />}
                      size="small"
                    >
                      {isTimerRunning ? 'Pause' : 'Start'}
                    </Button>
                    <Button variant="outlined" onClick={resetTimer} size="small">Reset</Button>
                    <Button variant="outlined" onClick={handleStopTimer} startIcon={<StopIcon />} size="small">Stop</Button>
                  </Box>
                </Box>
              )}
              
              {/* Music Controls Divider */}
              <Divider sx={{ my: 1 }} />
              
              {/* Volume Control */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MusicIcon color="primary" />
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Slider
                    value={volume}
                    onChange={handleVolumeChange}
                    min={0}
                    max={1}
                    step={0.1}
                    size="small"
                    sx={{ 
                      '& .MuiSlider-track': {
                        color: 'primary.main'
                      },
                      '& .MuiSlider-thumb': {
                        color: 'primary.main'
                      }
                    }}
                  />
                </Box>
                <Button variant="outlined" size="small" onClick={toggleMusic}>
                  {isPlaying ? 'Pause' : 'Resume'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Timer End Popup */}
          <Dialog open={isTimerEndPopupOpen} onClose={handleCloseTimerEndPopup}>
            <DialogTitle>Timer Ended!</DialogTitle>
            <DialogContent>
              <Typography>Your timer has ended. What would you like to do?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTimerEndPopup}>Stop Timer</Button>
              <Button onClick={handleAddMinute}>Add 1 Minute</Button>
            </DialogActions>
          </Dialog>

          {/* Settings Dialog */}
          <Dialog open={isSettingsOpen} onClose={toggleSettings} maxWidth="sm" fullWidth>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {/* Sound Selection */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Background Sound</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControl size="small">
                      <InputLabel>Sound Source</InputLabel>
                      <Select
                        value={soundSource}
                        onChange={handleSoundSourceChange}
                        label="Sound Source"
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="default">Default Sounds</MenuItem>
                        <MenuItem value="custom">Custom Sound</MenuItem>
                      </Select>
                    </FormControl>
                    {soundSource === 'default' && (
                      <FormControl size="small">
                        <InputLabel>Sound</InputLabel>
                        <Select
                          value={selectedSound}
                          onChange={handleDefaultSoundChange}
                          label="Sound"
                        >
                          {Object.keys(defaultSounds).filter(sound => sound !== 'timerEnd').map((sound) => (
                            <MenuItem key={sound} value={sound}>
                              {sound.charAt(0).toUpperCase() + sound.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {soundSource === 'custom' && (
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                      >
                        Upload Custom Sound
                        <input
                          type="file"
                          accept="audio/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setCustomSound(url);
                              if (audioRef.current) audioRef.current.pause();
                              audioRef.current = new Audio(url);
                              audioRef.current.loop = true;
                              audioRef.current.volume = volume;
                              if (isPlaying) safePlay(audioRef.current);
                            }
                          }}
                        />
                      </Button>
                    )}
                  </Box>
                </Paper>

                {/* Background Image */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Background Image</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                    >
                      Upload Background Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleBackgroundChange}
                      />
                    </Button>
                    {backgroundImage && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setBackgroundImage('');
                          localStorage.removeItem('background');
                        }}
                      >
                        Remove Background
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={toggleSettings}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Todo Input Section */}
          <Paper elevation={3} sx={{ p: 2, mb: 2, transition: 'all 0.3s ease' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Things to do?"
                variant="outlined"
                rows={1}
                InputProps={{
                  sx: {
                    '&::placeholder': {
                      fontStyle: 'italic',
                      color: 'text.secondary',
                    },
                    padding: '10px 12px',
                    borderRadius: '15px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                  },
                }}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddTodo()}
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: '0.95rem',
                  }
                }}
              />
              <Button variant="contained" onClick={handleAddTodo} size="small">
                Add
              </Button>
            </Box>
          </Paper>

          {/* Todo List Section */}
          <Paper elevation={3} sx={{ p: 2, mb: 2, transition: 'all 0.3s ease' }}>
            <List>
              {todos.map((todo, index) => (
                <ListItem
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: theme => theme.palette.mode === 'light' ? '#ffffff' : '#2d2d2d',
                    borderRadius: 2,
                    boxShadow: todo.completed
                      ? '0 2px 8px rgba(76, 175, 80, 0.1)'
                      : '0 2px 8px rgba(0,0,0,0.05)',
                    transform: todo.completed ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: todo.completed ? 'scale(0.99)' : 'scale(1.01)',
                      boxShadow: todo.completed
                        ? '0 4px 12px rgba(76, 175, 80, 0.15)'
                        : '0 4px 12px rgba(0,0,0,0.1)'
                    },
                    border: '1px solid',
                    borderColor: todo.completed ? 'success.light' : 'divider'
                  }}
                >
                  <ListItemText
                    primary={todo.text}
                    sx={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      opacity: todo.completed ? 0.7 : 1,
                      '& .MuiTypography-root': {
                        fontFamily: 'Quicksand, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: theme => theme.palette.mode === 'light' ? '#2d2d2d' : '#ffffff'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleToggleComplete(index)}
                      sx={{
                        mr: 1,
                        color: todo.completed ? 'success.main' : 'action.active',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: 'success.main',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteTodo(index)}
                      sx={{
                        color: 'error.main',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: 'error.dark',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Social Links */}
          <Paper elevation={3} sx={{ p: 2, mb: 2, transition: 'all 0.3s ease' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                size="small"
                variant="outlined" 
                startIcon={<LinkedInIcon />} 
                href="https://www.linkedin.com/" 
                target="_blank"
                sx={{ flex: 1, minWidth: '120px' }}
              >
                LinkedIn
              </Button>
              <Button 
                size="small"
                variant="outlined" 
                startIcon={<GitHubIcon />} 
                href="https://github.com/Aris2159" 
                target="_blank"
                sx={{ flex: 1, minWidth: '120px' }}
              >
                GitHub
              </Button>
              <Button 
                size="small"
                variant="outlined" 
                startIcon={<DiscordIcon />} 
                href="https://discord.com/invite/967zVWKXSH" 
                target="_blank"
                sx={{ flex: 1, minWidth: '120px' }}
              >
                Discord
              </Button>
              <Button 
                size="small"
                variant="contained" 
                color="primary" 
                startIcon={<CafeIcon />} 
                href="https://ko-fi.com/" 
                target="_blank"
                sx={{ flex: 1, minWidth: '120px' }}
              >
                Support
              </Button>
            </Box>
          </Paper>

        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;