import React, { useState, useContext } from 'react';
import {
    Box,
    Button,
    Typography,
    ThemeProvider,
    CssBaseline,
    Grid,
    Card,
    CardContent,
    Container,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { UserContext } from '../context/UserContext';

export default function Home() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const mode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;

    const theme = createTheme({
        palette: {
            mode,
            primary: { main: '#3366FF' },
            background: { default: '#F4F6F8' },
            text: { primary: mode === 'dark' ? '#FFF' : '#333' },
        },
        typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
    });

    const pages = ['Practice', 'Home', 'History'];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavBar
                pages={pages}
                currentMode={colorMode}
                onChangeColorMode={setColorMode}
                onToggleAIPanel={() => {}}
                username={user?.username}
            />

            {/* 英雄区 */}
            <Box
                component="section"
                sx={{
                    minHeight: 'calc(100vh - 64px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    px: 2,
                    background: mode === 'light'
                        ? 'linear-gradient(135deg, #DDEBFF 0%, #F4F6F8 100%)'
                        : 'linear-gradient(135deg, #1F1F3F 0%, #252547 100%)',
                }}
            >
                <Typography
                    variant="h2"
                    fontWeight={700}
                    gutterBottom
                    sx={{
                        textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                >
                    Welcome to CodeShin!
                </Typography>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                    Enhance your coding skills with AI-powered practice.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/practice')}
                    >
                        Practice
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/history')}
                    >
                        History
                    </Button>
                </Box>
            </Box>

            {/* 关键特性 & 系统栈 */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Typography variant="h4" fontWeight={600} align="center" gutterBottom>
                    Key Features
                </Typography>
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    {[
                        {
                            title: 'Extensive Problem Library',
                            desc: '1,825 LeetCode problems across 60 topics, covering Beginner to Advanced levels.',
                        },
                        {
                            title: 'AI-Assisted Scoring',
                            desc: 'Real-time debugging and ChatGPT-based scoring to track your mastery.',
                        },
                        {
                            title: 'Personalized Recommendations',
                            desc: 'Tailored suggestions via grey relational analysis for your unique learning path.',
                        },
                    ].map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.title}>
                            <Card
                                elevation={3}
                                sx={{
                                    borderRadius: 3,
                                    transition: 'transform 0.3s',
                                    '&:hover': { transform: 'scale(1.04)' },
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" fontWeight={500} gutterBottom>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Typography variant="h4" fontWeight={600} align="center" gutterBottom>
                    System Stack
                </Typography>
                <Grid container spacing={4}>
                    {[
                        { label: 'Frontend', detail: 'React & Material UI' },
                        { label: 'Backend', detail: 'Django & RESTful APIs' },
                        { label: 'Database', detail: 'MySQL for data persistence' },
                    ].map((item) => (
                        <Grid item xs={12} sm={4} key={item.label}>
                            <Card elevation={1} sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={600} align="center">
                                        {item.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" align="center">
                                        {item.detail}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </ThemeProvider>
    );
}
