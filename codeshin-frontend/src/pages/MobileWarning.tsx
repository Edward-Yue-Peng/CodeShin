// src/MobileWarning.tsx
// 要求使用电脑端访问

import React from 'react';
import { Box, Typography } from '@mui/material';

const MobileWarning: React.FC = () => {
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
                textAlign: 'center',
            }}
        >
            <Typography variant="h2" gutterBottom>💻</Typography>
            <Typography variant="h4" gutterBottom>
                Please Use a Desktop
            </Typography>
            <Typography variant="body1">
                CodeShin is optimized for desktop use. Please switch to a device with a wider screen for the best experience.
            </Typography>
        </Box>
    );
};

export default MobileWarning;
