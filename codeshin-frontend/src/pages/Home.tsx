import React, {useState, useEffect, useContext} from 'react';
import { Box, Button, Typography, ThemeProvider, CssBaseline, Paper } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';

import NavBar from '../components/NavBar';
import {UserContext} from "../context/UserContext";

function Home() {
    const [totalProblemsSolved, setTotalProblemsSolved] = useState(0);
    const [userLevel, setUserLevel] = useState('Beginner');

    const navigate = useNavigate();
    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const effectiveMode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;
    const { user } = useContext(UserContext);
    const theme = createTheme({
        palette: {
            mode: effectiveMode,
        },
    });

    useEffect(() => {
        setTotalProblemsSolved(42);
        setUserLevel('Intermediate');
    }, []);

    const pages = ['Practice','Home',  'History'];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavBar
                onToggleAIPanel={() => {}}
                pages={pages}
                currentMode={colorMode}
                onChangeColorMode={setColorMode}
                username={user?.username}
            />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(100vh - 64px)',
                    textAlign: 'center',
                    p: 3,
                    backgroundColor: theme.palette.background.default,
                }}
            >

                    <Typography variant="h3" fontWeight={600} gutterBottom>
                        Welcome to CodeShin!
                    </Typography>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        Enhance your coding skills with practice.
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
                        Problems solved: <strong>{totalProblemsSolved}</strong>
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 500 }}>
                        Current Level: <strong>{userLevel}</strong>
                    </Typography>
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button variant="contained" color="primary" size="large" onClick={() => navigate('/practice')}>
                            Practice
                        </Button>
                        <Button variant="outlined" color="primary" size="large" onClick={() => navigate('/analysis')}>
                            Analysis
                        </Button>
                    </Box>
            </Box>
        </ThemeProvider>
    );
}

export default Home;
