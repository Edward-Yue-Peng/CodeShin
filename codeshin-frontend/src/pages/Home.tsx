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
    Fade,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavBar from '../components/NavBar';
import { UserContext } from '../context/UserContext';

export default function Home() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const mode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;
    const effectiveMode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;
    const theme = createTheme({ palette: { mode: effectiveMode } });

    const pages = ['Practice', 'Home', 'History'];
    const features = [
        { title: 'Extensive Problem Library', desc: '1,825 LeetCode problems across 60 topics, covering Beginner to Advanced levels.' },
        { title: 'AI-Assisted Scoring', desc: 'Real-time debugging and ChatGPT-based scoring to track your mastery.' },
        { title: 'Personalized Recommendations', desc: 'Tailored suggestions via grey relational analysis for your unique learning path.' },
    ];
    const stack = [
        { label: 'Frontend', detail: 'React & Material UI' },
        { label: 'Backend', detail: 'Django' },
        { label: 'Database', detail: 'MySQL' },
    ];
    const abstractText = `
CodeShin is an AI-assisted code training platform offering personalized practice and feedback. 
It stores 1,825 LeetCode problems across 60 topics, each labeled Beginner, Intermediate, or Advanced via automated tag extraction and a ChatGPT-based scorer. 
A Grey Relational Analysis recommendation engine computes six metrics—similarity, topic match, difficulty match, knowledge reinforcement, interest, and learning-path conformity—to dynamically weight and suggest problems tailored to individual performance. 
The prototype features interactive code editing, debugging tools, and a chat interface for real-time guidance. 
Pilot tests demonstrate higher engagement and faster skill gains compared to non-personalized systems. 
Future work will integrate collaborative filtering and expand problem coverage.
`.trim();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <NavBar
                    pages={pages}
                    currentMode={colorMode}
                    onChangeColorMode={setColorMode}
                    onToggleAIPanel={() => {}}
                    username={user?.username}
                />
                <Box component="main" sx={{ flex: 1, overflowY: 'auto' }}>
                    {/* Hero 区 */}
                    <Box
                        component="section"
                        sx={{
                            minHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            px: 2,
                            py: 8,
                            position: 'relative',
                            background: mode === 'light'
                                ? 'linear-gradient(135deg, #EEF2FF 0%, #F9FAFB 100%)'
                                : 'linear-gradient(135deg, #1C1C2E 0%, #111127 100%)',
                        }}
                    >
                        <Typography variant="h2" fontWeight={700} gutterBottom>
                            Welcome to CodeShin!
                        </Typography>
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                            Enhance your coding skills with AI-powered practice.
                        </Typography>
                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                            <Button variant="contained" size="large" onClick={() => navigate('/practice')}>
                                Practice
                            </Button>
                            <Button variant="outlined" size="large" onClick={() => navigate('/history')}>
                                History
                            </Button>
                        </Box>

                        {/* Scroll Indicator */}
                        <Fade in timeout={1000} style={{ transitionDelay: '1500ms' }}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 32,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    color: 'text.secondary',
                                    cursor: 'pointer',
                                }}
                                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                            >
                                <ExpandMoreIcon fontSize="large" />
                            </Box>
                        </Fade>
                    </Box>

                    {/* Abstract */}
                    <Container maxWidth="md" sx={{ py: 6 }}>
                        <Typography variant="h4" fontWeight={600} align="center" gutterBottom>
                            Abstract
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                whiteSpace: 'pre-line',
                                maxWidth: 800,
                                mx: 'auto',
                                textAlign: 'left',
                                lineHeight: 2,
                            }}
                        >
                            {abstractText}
                        </Typography>
                    </Container>

                    {/* Key Features */}
                    <Container maxWidth="lg" sx={{ py: 6 }}>
                        <Typography variant="h4" fontWeight={600} align="center" gutterBottom>
                            Key Features
                        </Typography>
                        <Grid container spacing={4} sx={{ mb: 6 }}>
                            {features.map((item) => (
                                <Grid item xs={12} sm={6} md={4} key={item.title}>
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            transition: 'transform 0.3s',
                                            '&:hover': { transform: 'scale(1.02)' },
                                        }}
                                    >
                                        <CardContent>
                                            <Typography variant="subtitle1" align="center" fontWeight={600}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" align="center" color="text.secondary">
                                                {item.desc}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* System Stack */}
                        <Typography variant="h4" fontWeight={600} align="center" gutterBottom>
                            System Stack
                        </Typography>
                        <Grid container spacing={4}>
                            {stack.map((item) => (
                                <Grid item xs={12} sm={4} key={item.label}>
                                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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
                    <Container maxWidth="md" sx={{ py: 6 }}>
                        <Typography variant="h4" fontWeight={600} align="center" gutterBottom>
                            Our Team
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                whiteSpace: 'pre-line',
                                maxWidth: 400,
                                mx: 'auto',
                                textAlign: 'center', // 这里改成居中
                                lineHeight: 2,
                            }}
                        >
                            {'Baosheng Jin, Chuke Liu, Jinhan Niu, Mingqian Yang, Xiangxiang Hu, Yue Peng, Yutian Si, Ziye Cao\n(Listed in alphabetical order)\nFaculty mentor: Prof. Hongyi Wen'}
                        </Typography>
                    </Container>


                </Box>
            </Box>
        </ThemeProvider>
    );
}
