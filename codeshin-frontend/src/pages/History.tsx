// src/pages/History.tsx
// 用户做题历史

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
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import NavBar from '../components/NavBar';
import { UserContext } from '../context/UserContext';
import useMediaQuery from "@mui/material/useMediaQuery";

interface HistoryItem {
    problem_id: number;
    problem_id__title: string;
    version: number;
    is_passed: boolean;
    submission_status: string | null;
    timestamp: string;
}

function History() {
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useContext(UserContext);
    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const effectiveMode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;

    const theme = createTheme({
        palette: {
            mode: effectiveMode,
        },
    });
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
            .then(data => {
                setHistoryData(data.history);
            })
            .catch(err => {
                setError(err.message || '获取历史记录失败');
            })
            .finally(() => setLoading(false));
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
                                // TODO 这里要不要展示is passed？
                                const statusText = entry.submission_status
                                    ? entry.submission_status
                                    : entry.is_passed
                                        ? 'Passed'
                                        : 'Failed';
                                return (
                                    <ListItem key={index} divider>
                                        <ListItemText
                                            primary={`${entry.problem_id__title}`}
                                            secondary={`Problem ID: ${entry.problem_id} | Version: ${entry.version} | Status: ${statusText} | Time: ${new Date(
                                                entry.timestamp
                                            ).toLocaleString()}`}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </Paper>
            </Box>
        </ThemeProvider>
    );
}

export default History;
