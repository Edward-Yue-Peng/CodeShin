import React, { useState } from 'react';
import { Box, Typography, ThemeProvider, CssBaseline, Paper, List, ListItem, ListItemText, Grid } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BarChart } from '@mui/x-charts/BarChart';
import NavBar from '../components/NavBar';

function Analysis() {
    const [historyData, setHistoryData] = useState([
        { date: '2025-03-01', problemsSolved: 10, difficulty: 'Medium' },
        { date: '2025-03-02', problemsSolved: 7, difficulty: 'Hard' },
        { date: '2025-03-03', problemsSolved: 12, difficulty: 'Easy' },
        { date: '2025-03-04', problemsSolved: 5, difficulty: 'Medium' },
        { date: '2025-03-05', problemsSolved: 8, difficulty: 'Hard' },
        { date: '2025-03-06', problemsSolved: 9, difficulty: 'Medium' },
    ]);

    const [selectedData, setSelectedData] = useState(historyData[0]);

    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const effectiveMode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;

    const theme = createTheme({
        palette: {
            mode: effectiveMode,
        },
    });

    const pages = ['Practice','Home',  'Analysis'];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavBar
                onToggleAIPanel={() => {}}
                onOpenUserMenu={() => {}}
                pages={pages}
                currentMode={colorMode}
                onChangeColorMode={setColorMode}
            />
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'row', gap: 3 }}>
                {/* Left: History List */}
                <Box sx={{ width: '30%', overflowY: 'auto' }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        History
                    </Typography>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <List>
                            {historyData.map((entry, index) => (
                                <ListItem
                                    key={index}
                                    onClick={() => setSelectedData(entry)}
                                    divider
                                >
                                    <ListItemText
                                        primary={`Date: ${entry.date} - Solved: ${entry.problemsSolved}`}
                                        secondary={`Difficulty: ${entry.difficulty}`}
                                    />
                                </ListItem>

                            ))}
                        </List>
                    </Paper>
                </Box>

                {/* Right: Chart Display */}
                <Box sx={{ width: '70%' }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Performance Overview
                    </Typography>
                    <Paper elevation={3} sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                        <BarChart
                            dataset={historyData.map(item => ({
                                label: item.date,
                                value: item.problemsSolved
                            }))}
                            xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
                            series={[{ dataKey: 'value', label: 'Problems Solved' }]}
                            width={500}
                            height={300}
                        />
                    </Paper>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default Analysis;
