import React, { useState, useRef, useEffect } from 'react';
import { Paper, Box, IconButton, Typography, Stack } from '@mui/material';
import Draggable from 'react-draggable';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const ImageViewer = ({ onClose, imageSet }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isResizing, setIsResizing] = useState(null);
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

  // Add this effect to initialize transform
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerRef.current.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
      containerRef.current.style.left = '0';
      containerRef.current.style.top = '0';
    }
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    } else {
      setSize({ width: 800, height: 600 });
    }
  };

  return (
    <Draggable handle=".drag-handle" bounds="parent" disabled={isFullscreen}>
      <Paper
        ref={containerRef}
        elevation={3}
        sx={{
          position: 'absolute',
          right: '20px',
          top: '80px',
          width: size.width,
          height: size.height,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 1000,
          cursor: 'auto',
          '&:hover': {
            '& .resize-handle': {
              opacity: 1
            }
          }
        }}
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

export default ImageViewer; 