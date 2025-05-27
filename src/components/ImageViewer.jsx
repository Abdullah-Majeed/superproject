import React, { useState, useRef } from 'react';
import { Paper, Box, IconButton, Typography, Stack } from '@mui/material';
import Draggable from 'react-draggable';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const ImageViewer = ({ onClose, imageSet }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const resizeRef = useRef(null);

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
      const newWidth = Math.max(400, Math.min(e.clientX - rect.left, window.innerWidth * 0.9));
      const newHeight = Math.max(300, Math.min(e.clientY - rect.top, window.innerHeight * 0.9));
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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
          top: '80px',
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
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              Section Images
            </Typography>
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

          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              p: 2, 
              flexGrow: 1, 
              overflowY: 'auto',
              height: 'calc(100% - 32px)'
            }}
          >
            {imageSet && (
              <>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>Stitch</Typography>
                  <Box 
                    component="img" 
                    src={imageSet.stitch} 
                    sx={{ 
                      width: '100%', 
                      height: 'calc(100% - 24px)', 
                      objectFit: 'contain',
                      backgroundColor: '#000'
                    }} 
                  />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>Depth</Typography>
                  <Box 
                    component="img" 
                    src={imageSet.depth} 
                    sx={{ 
                      width: '100%', 
                      height: 'calc(100% - 24px)', 
                      objectFit: 'contain',
                      backgroundColor: '#000'
                    }} 
                  />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>Mask</Typography>
                  <Box 
                    component="img" 
                    src={imageSet.mask} 
                    sx={{ 
                      width: '100%', 
                      height: 'calc(100% - 24px)', 
                      objectFit: 'contain',
                      backgroundColor: '#000'
                    }} 
                  />
                </Box>
              </>
            )}
          </Stack>
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

export default ImageViewer; 