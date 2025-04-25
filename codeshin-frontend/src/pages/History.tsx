// src/pages/History.tsx
// 用户做题历史与成长功能（分栏布局，支持 Markdown 格式反馈）

import React, { useContext, useState, useEffect } from 'react';
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
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import NavBar from '../components/NavBar';
import { UserContext } from '../context/UserContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
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

function History() {
    const { user } = useContext(UserContext);
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [scoresData, setScoresData] = useState<ScoreItem[]>([]);
    const [scoresLoading, setScoresLoading] = useState<boolean>(false);
    const [scoresError, setScoresError] = useState<string | null>(null);

    // 将建议作为长文本处理
    const [suggestions, setSuggestions] = useState<string>('');
    const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(true);
    const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const effectiveMode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;

    const theme = createTheme({ palette: { mode: effectiveMode } });
    const pages = ['Practice', 'Home', 'History'];
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // 获取用户历史记录
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

    // 获取用户最近得分
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

    // 获取 GPT 成长反馈（Markdown 文本）
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
            <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                    {/* 左侧：历史记录 */}
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
                                    {historyData.map((entry, index) => {
                                        const statusText = entry.submission_status
                                            ? entry.submission_status
                                            : entry.is_passed
                                                ? 'Passed'
                                                : 'Failed';
                                        return (
                                            <ListItem key={index} divider>
                                                <ListItemText
                                                    primary={entry.problem_id__title}
                                                    secondary={`ID: ${entry.problem_id} | Ver: ${entry.version} | Status: ${statusText} | Time: ${new Date(
                                                        entry.timestamp
                                                    ).toLocaleString()}`}
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* 右侧：分数曲线 & 成长反馈 */}
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
                                        <LineChart
                                            data={scoresData.map(item => ({ name: `#${item.problem_id}`, score: item.score }))}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
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
                            <Paper elevation={3} sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
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
