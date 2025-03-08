import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

function Home() {
    const [totalProblemsSolved, setTotalProblemsSolved] = useState(0);
    const [userLevel, setUserLevel] = useState('Beginner');

    const navigate = useNavigate();
    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const effectiveMode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;

    const theme = createTheme({
        palette: {
            mode: effectiveMode,
        },
    });

    useEffect(() => {
        // 这里可以添加从后端获取用户刷题信息的逻辑
        setTotalProblemsSolved(42); // 示例数据
        setUserLevel('Intermediate'); // 示例数据
    }, []);

    const pages = ['Practice','Home',  'Analysis'];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavBar
                onToggleAIPanel={() => {}} // 主页不需要 AI 面板
                onOpenUserMenu={() => {}}
                pages={pages}
                currentMode={colorMode}
                onChangeColorMode={setColorMode}
            />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(100vh - 64px)',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Welcome to CodeShin!
                </Typography>
                <Typography variant="h6" gutterBottom>
                    You have solved {totalProblemsSolved} problems.
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Your current level: {userLevel}
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => navigate('/practice')}>
                        Start Practicing
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => navigate('/analysis')}>
                        View History
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default Home;