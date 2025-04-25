// src/pages/History.tsx
// 用户做题历史与成长功能（分栏布局，支持 Markdown 格式反馈，折线图反序且可点击 Tooltip 并适配暗黑模式）

import React, { useContext, useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    ThemeProvider,
    CssBaseline,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Grid,
    Tooltip,
} from '@mui/material';
import { createTheme, useTheme } from '@mui/material/styles';
import NavBar from '../components/NavBar';
import { UserContext } from '../context/UserContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';

interface HistoryItem {
    problem_id: number;
    problem_id__title: string;
    version: number;
    is_passed: boolean;
    submission_status: string | null;
    timestamp: string;
}
interface ScoreItem {
    problem_id: number;
    score: number;
}
interface ChartDataItem {
    id: number;
    name: string;
    score: number;
    title: string;
}

function History() {
    const { user } = useContext(UserContext);
    const muiTheme = useTheme();
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [scoresData, setScoresData] = useState<ScoreItem[]>([]);
    const [scoresLoading, setScoresLoading] = useState<boolean>(false);
    const [scoresError, setScoresError] = useState<string | null>(null);

    const [suggestions, setSuggestions] = useState<string>('');
    const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(true);
    const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const effectiveMode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;

    const theme = createTheme({ palette: { mode: effectiveMode } });
    const pages = ['Practice', 'Home', 'History'];
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        setError(null);
        fetch(`${API_URL}/api/get_user_history/?user_id=${user.userId}&page=1&page_size=100`)
            .then(res => {
                if (!res.ok) throw new Error(`Error: ${res.status}`);
                return res.json();
            })
            .then(data => setHistoryData(data.history))
            .catch(err => setError(err.message || '获取历史记录失败'))
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => {
        if (!user) return;
        setScoresLoading(true);
        setScoresError(null);
        fetch(`${API_URL}/api/get_user_last_scores/?user_id=${user.userId}`)
            .then(res => {
                if (!res.ok) throw new Error(`Error: ${res.status}`);
                return res.json();
            })
            .then(data => setScoresData(data.last_scores))
            .catch(err => setScoresError(err.message || '获取分数失败'))
            .finally(() => setScoresLoading(false));
    }, [user]);

    useEffect(() => {
        if (!user) return;
        setSuggestionsLoading(true);
        setSuggestionsError(null);
        fetch(`${API_URL}/api/get_growth_path_advice/?user_id=${user.userId}`)
            .then(res => {
                if (!res.ok) throw new Error(`Error: ${res.status}`);
                return res.json();
            })
            .then(data => setSuggestions(data.suggestions))
            .catch(err => setSuggestionsError(err.message || '获取成长反馈失败'))
            .finally(() => setSuggestionsLoading(false));
    }, [user]);

    const chartData = useMemo<ChartDataItem[]>(() =>
            scoresData
                .map(item => {
                    const entry = historyData.find(h => h.problem_id === item.problem_id);
                    return {
                        id: item.problem_id,
                        name: `#${item.problem_id}`,
                        score: item.score,
                        title: entry?.problem_id__title || '-',
                    };
                })
                .reverse()
        , [scoresData, historyData]);

    const CustomizedTick = ({ x, y, payload }: any) => {
        const dataItem = chartData.find(d => d.name === payload.value);
        const fillColor = "#666666";
        return (
            <Tooltip title={dataItem?.title || ''} arrow placement="top">
                <text
                    x={x}
                    y={y + 10}
                    textAnchor="middle"
                    fill={fillColor}
                    style={{ cursor: dataItem?.title ? 'pointer' : 'default' }}
                >
                    {payload.value}
                </text>
            </Tooltip>
        );
    };

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
                    p: 3,
                    height: 'calc(100vh - 64px)',
                    overflowY: 'auto',
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                            History
                        </Typography>
                        <Paper elevation={3} sx={{ p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <CircularProgress />
                                </Box>
                            ) : error ? (
                                <Alert severity="error">{error}</Alert>
                            ) : (
                                <List>
                                    {historyData.map((entry, idx) => (
                                        <ListItem key={idx} divider>
                                            <ListItemText
                                                primary={entry.problem_id__title}
                                                secondary={`ID: ${entry.problem_id} | Ver: ${entry.version} | Status: ${
                                                    entry.submission_status || (entry.is_passed ? 'Passed' : 'Failed')
                                                } | Time: ${new Date(entry.timestamp).toLocaleString()}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} container direction="column" spacing={2}>
                        <Grid item>
                            <Typography variant="h5" fontWeight={600} gutterBottom>
                                Score Trend
                            </Typography>
                            <Paper elevation={3} sx={{ p: 2, height: 300 }}>
                                {scoresLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : scoresError ? (
                                    <Alert severity="error">{scoresError}</Alert>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={<CustomizedTick />} />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Line type="monotone" dataKey="score" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </Paper>
                        </Grid>
                        <Grid item>
                            <Typography variant="h5" fontWeight={600} gutterBottom>
                                Growth Feedback
                            </Typography>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 2,
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                }}
                            >
                                {suggestionsLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : suggestionsError ? (
                                    <Alert severity="error">{suggestionsError}</Alert>
                                ) : (
                                    <Typography
                                        variant="body2"
                                        component="div"
                                        sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                                    >
                                        {suggestions}
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    );
}

export default History;
