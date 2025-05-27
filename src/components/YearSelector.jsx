import React, { useState } from 'react';
import {
    Box,
    FormControl,
    Select,
    MenuItem,
    Typography,
    Drawer,
    IconButton,
    Switch,
    FormControlLabel,
    Divider,
    Stack
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ImageIcon from '@mui/icons-material/Image';

const YearSelector = ({
    selectedYear,
    onYearChange,
    showDistress,
    onDistressToggle,
    showVideo,
    onVideoToggle,
    showImages,
    onImagesToggle
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <IconButton
                onClick={toggleDrawer}
                sx={{
                    position: 'absolute',
                    left: isOpen ? 240 : 0,
                    top: 20,
                    left: 10,
                    zIndex: 1200,
                    backgroundColor: 'white',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: 2,
                    '&:hover': {
                        backgroundColor: '#f5f5f5'
                    },
                    transition: 'left 0.3s'
                }}
            >
                {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>

            <Drawer
                variant="persistent"
                anchor="left"
                open={isOpen}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                        top: 0,
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(5px)',
                        border: 'none',
                        boxShadow: 3
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 3 }}
                    >
                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 500 }}>
                            Airport Infrastructure
                        </Typography>
                        <IconButton
                            onClick={toggleDrawer}
                            size="small"
                            sx={{
                                color: '#666',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                            Select Year
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={selectedYear}
                                onChange={onYearChange}
                            >
                                <MenuItem value={2025}>2025 (Latest)</MenuItem>
                                <MenuItem value={2024}>2024</MenuItem>
                                <MenuItem value={2023}>2023</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Stack spacing={1}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showDistress}
                                    onChange={onDistressToggle}
                                    color="primary"
                                    size="small"
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    Show Distress Points
                                </Typography>
                            }
                        />

                        {showDistress && (
                            <>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showVideo}
                                            onChange={onVideoToggle}
                                            color="primary"
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            Show Video Player
                                        </Typography>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showImages}
                                            onChange={onImagesToggle}
                                            color="primary"
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            Show Section Images
                                        </Typography>
                                    }
                                />
                            </>
                        )}
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                        Condition Scale
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, backgroundColor: 'darkgreen', borderRadius: '50%' }} />
                            <Typography variant="body2">Excellent (81-100)</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, backgroundColor: '#57C018', borderRadius: '50%' }} />
                            <Typography variant="body2">Good (61-80)</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, backgroundColor: 'yellow', borderRadius: '50%' }} />
                            <Typography variant="body2">Fair (41-60)</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, backgroundColor: 'darkorange', borderRadius: '50%' }} />
                            <Typography variant="body2">Poor (21-40)</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, backgroundColor: 'red', borderRadius: '50%' }} />
                            <Typography variant="body2">Very Poor (0-20)</Typography>
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default YearSelector; 