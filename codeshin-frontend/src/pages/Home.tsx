// src/Home.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const Home: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Home Page</Typography>
            <Typography variant="body1">
                Welcome to the Home Page. This is the new page you navigate to when clicking "Home" in the AppBar.
            </Typography>
        </Box>
    );
};

export default Home;
