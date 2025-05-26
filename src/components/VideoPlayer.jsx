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
  const [isDragging, setIsDragging] = useState(false);
  const [size, setSize] = useState({ width: 500, height: 500 });
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const resizeRef = useRef(null);

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

  const handleMouseDown = (e) => {
    if (e.target === resizeRef.current) {
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newWidth = Math.max(320, Math.min(e.clientX - rect.left, window.innerWidth * 0.8));
      const newHeight = Math.max(240, Math.min(e.clientY - rect.top, window.innerHeight * 0.8));
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Draggable handle=".drag-handle" bounds="parent">
      <Paper
        ref={containerRef}
        elevation={3}
        sx={{
          position: 'absolute',
          right: '20px',
          bottom: '20px',
          width: isFullscreen ? '100%' : size.width,
          height: isFullscreen ? '100%' : size.height,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 1000,
          cursor: isDragging ? 'se-resize' : 'auto'
        }}
        onMouseDown={handleMouseDown}
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
                objectFit: 'cover',
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

        {/* Resize handle */}
        <Box
          ref={resizeRef}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 20,
            height: 20,
            cursor: 'se-resize',
            '&::before': {
              content: '""',
              position: 'absolute',
              right: 4,
              bottom: 4,
              width: 8,
              height: 8,
              borderRight: '2px solid #666',
              borderBottom: '2px solid #666'
            }
          }}
        />
      </Paper>
    </Draggable>
  );
};

export default VideoPlayer; 