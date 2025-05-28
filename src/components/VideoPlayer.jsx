import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Paper, Typography, Slider, Stack } from '@mui/material';
import Draggable from 'react-draggable';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import videoFile from '../assets/video.MP4';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VideoPlayer = ({ onClose, onCarPositionUpdate, seekToTime }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [size, setSize] = useState({ width: 500, height: 400 });
  const [isResizing, setIsResizing] = useState(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const handleMouseDown = (e, direction) => {
    if (direction) {
      setIsResizing(direction);
      e.stopPropagation();
    }
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;

    e.preventDefault();
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    let newWidth = size.width;
    let newHeight = size.height;
    let deltaX = 0;
    let deltaY = 0;

    // Handle horizontal resizing
    if (isResizing.includes('left')) {
      const proposedWidth = rect.right - e.clientX;
      if (proposedWidth >= 320 && e.clientX >= 0) {
        deltaX = e.clientX - rect.left;
        newWidth = proposedWidth;
      }
    } else if (isResizing.includes('right')) {
      const proposedWidth = e.clientX - rect.left;
      if (proposedWidth >= 320 && e.clientX <= window.innerWidth) {
        newWidth = proposedWidth;
      }
    }

    // Handle vertical resizing
    if (isResizing.includes('top')) {
      const proposedHeight = rect.bottom - e.clientY;
      if (proposedHeight >= 240 && e.clientY >= 0) {
        deltaY = e.clientY - rect.top;
        newHeight = proposedHeight;
      }
    } else if (isResizing.includes('bottom')) {
      const proposedHeight = e.clientY - rect.top;
      if (proposedHeight >= 240 && e.clientY <= window.innerHeight) {
        newHeight = proposedHeight;
      }
    }

    // Update size
    setSize({
      width: newWidth,
      height: newHeight
    });

    // Update position using transform
    if (deltaX !== 0 || deltaY !== 0) {
      const currentTransform = window.getComputedStyle(container).transform;
      const matrix = new DOMMatrix(currentTransform);
      const newX = matrix.m41 + deltaX;
      const newY = matrix.m42 + deltaY;
      container.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizing === 'right' ? 'e-resize' : 
                                  isResizing === 'bottom' ? 's-resize' : 'se-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      onCarPositionUpdate?.(progress);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onCarPositionUpdate]);

  useEffect(() => {
    if (seekToTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekToTime;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [seekToTime]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      setVolume(newValue);
    }
  };

  const handleSeek = (event, newValue) => {
    if (videoRef.current) {
      const time = (newValue / 100) * duration;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    } else {
      setSize({ width: 500, height: 400 });
    }
  };

  // Add this effect to initialize transform
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerRef.current.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
      containerRef.current.style.left = '0';
      containerRef.current.style.top = '0';
    }
  }, []);

  return (
    <Draggable handle=".drag-handle" bounds="parent" disabled={isFullscreen}>
      <Paper
        ref={containerRef}
        elevation={3}
        sx={{
          position: 'absolute',
          left: '20px',
          bottom: '20px',
          width: size.width,
          height: size.height,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 1000,
          cursor: isResizing ? 'se-resize' : 'auto',
          '&:hover': {
            '& .resize-handle': {
              opacity: 1
            }
          }
        }}
        onMouseDown={(e) => handleMouseDown(e, null)}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            className="drag-handle"
            sx={{
              padding: '4px 8px',
              height: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              cursor: 'move',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            <Box>
              <IconButton
                size="small"
                onClick={toggleFullscreen}
                sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)', padding: '4px' }}
              >
                {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: 'rgba(0, 0, 0, 0.54)', padding: '4px' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ position: 'relative', flexGrow: 1, backgroundColor: '#000' }}>
            <video
              ref={videoRef}
              style={{ 
                width: '100%', 
                height: '100%', 
                display: 'block', 
                objectFit: 'contain',
                backgroundColor: '#000'
              }}
              src={videoFile}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '8px'
              }}
            >
              <Stack spacing={1}>
                <Slider
                  size="small"
                  value={(currentTime / duration) * 100 || 0}
                  onChange={handleSeek}
                  sx={{
                    color: 'white',
                    '& .MuiSlider-thumb': {
                      width: 12,
                      height: 12
                    }
                  }}
                />

                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    onClick={togglePlay}
                    size="small"
                    sx={{ color: 'white' }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>

                  <IconButton
                    onClick={handleRestart}
                    size="small"
                    sx={{ color: 'white' }}
                  >
                    <RestartAltIcon />
                  </IconButton>

                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                    <IconButton
                      onClick={toggleMute}
                      size="small"
                      sx={{ color: 'white' }}
                    >
                      {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                    </IconButton>
                    <Slider
                      size="small"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      min={0}
                      max={1}
                      step={0.1}
                      sx={{
                        width: 60,
                        ml: 1,
                        color: 'white',
                        '& .MuiSlider-thumb': {
                          width: 12,
                          height: 12
                        }
                      }}
                    />
                  </Box>

                  <Typography variant="caption" sx={{ color: 'white', ml: 'auto' }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Resize handles - edges */}
        <Box
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, 'left')}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '8px',
            height: '100%',
            cursor: 'w-resize',
            opacity: 0,
            transition: 'opacity 0.2s',
            '&:hover': {
              opacity: 1
            }
          }}
        />
        <Box
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, 'right')}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '8px',
            height: '100%',
            cursor: 'e-resize',
            opacity: 0,
            transition: 'opacity 0.2s',
            '&:hover': {
              opacity: 1
            }
          }}
        />
        <Box
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, 'top')}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '8px',
            cursor: 'n-resize',
            opacity: 0,
            transition: 'opacity 0.2s',
            '&:hover': {
              opacity: 1
            }
          }}
        />
        <Box
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, 'bottom')}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '8px',
            cursor: 's-resize',
            opacity: 0,
            transition: 'opacity 0.2s',
            '&:hover': {
              opacity: 1
            }
          }}
        />

        {/* Resize handles - corners */}
        <Box
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, 'top-left')}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '16px',
            height: '16px',
            cursor: 'nw-resize',
            opacity: 0,
            transition: 'opacity 0.2s',
            backgroundColor: 'transparent',
            '&:hover': {
              opacity: 1
            }
          }}
        />
        <Box
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, 'top-right')}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '16px',
            height: '16px',
            cursor: 'ne-resize',
            opacity: 0,
            transition: 'opacity 0.2s',
            backgroundColor: 'transparent',
            '&:hover': {
              opacity: 1
            }
          }}
        />
        <Box
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '16px',
            height: '16px',
            cursor: 'sw-resize',
            opacity: 0,
            transition: 'opacity 0.2s',
            backgroundColor: 'transparent',
            '&:hover': {
              opacity: 1
            }
          }}
        />
        <Box
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '16px',
            height: '16px',
            cursor: 'se-resize',
            opacity: 0,
            transition: 'opacity 0.2s',
            backgroundColor: 'transparent',
            '&:hover': {
              opacity: 1
            }
          }}
        />
      </Paper>
    </Draggable>
  );
};

export default VideoPlayer; 