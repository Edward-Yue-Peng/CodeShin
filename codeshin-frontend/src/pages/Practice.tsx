// src/Practice.tsx

import React, { useState, useRef, lazy, Suspense } from 'react';
import Box from '@mui/material/Box';
import Split from 'react-split';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import NavBar from '../components/NavBar';
import Description from '../components/Description';

const CodeEditor = lazy(() => import('../components/CodeEditor'));
const AIPanel = lazy(() => import('../components/AIPanel'));

function Practice() {
    const [splitSizes, setSplitSizes] = useState<number[]>([25, 50, 25]);
    const [storedThreeSizes, setStoredThreeSizes] = useState<number[]>([25, 50, 25]);
    const [aiVisible, setAiVisible] = useState(true);

    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const effectiveMode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;

    const theme = createTheme({
        palette: {
            mode: effectiveMode,
        },
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const handleToggleAIPanel = () => {
        if (aiVisible) {
            setStoredThreeSizes(splitSizes);
            const total = splitSizes[0] + splitSizes[1];
            setSplitSizes([
                (splitSizes[0] / total) * 100,
                (splitSizes[1] / total) * 100,
            ]);
            setAiVisible(false);
        } else {
            setSplitSizes(storedThreeSizes);
            setAiVisible(true);
        }
    };

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const pages = ['Practice', 'Home', 'Analysis'];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavBar
                onToggleAIPanel={handleToggleAIPanel}
                onOpenUserMenu={handleOpenUserMenu}
                pages={pages}
                currentMode={colorMode}
                onChangeColorMode={setColorMode}
            />
            <Box
                ref={containerRef}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100vh - 64px)',
                    overflow: 'hidden',
                    minHeight: 0,
                }}
            >
                <Split
                    sizes={aiVisible ? splitSizes : [50, 50]}
                    minSize={100}
                    gutterSize={10}
                    direction="horizontal"
                    onDragEnd={(newSizes) => setSplitSizes(newSizes)}
                    // 让 Split 也能在父容器中自由伸展
                    style={{ display: 'flex', width: '100%',flexGrow: 1,height: '100%', minHeight: 0 }}
                    // style={{ display: 'flex', ,  }}
                >
                    {/* Left Pane */}
                    <Box
                        sx={{
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            // 关键：只在这个面板内部出现滚动条
                            overflow: 'auto',
                            minHeight: 0,
                        }}
                    >
                        <Description />
                    </Box>

                    {/* Middle Pane */}
                    <Box
                        sx={{
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            overflow: 'auto',
                            minHeight: 0,
                        }}
                    >
                        <Suspense fallback={<div>Loading Code Editor...</div>}>
                            <CodeEditor />
                        </Suspense>
                    </Box>

                    {/* Right Pane */}
                    {aiVisible && (
                        <Box
                            sx={{
                                backgroundColor: 'background.paper',
                                overflow: 'auto',
                                minHeight: 0,
                            }}
                        >
                            <Suspense fallback={<div>Loading AI Panel...</div>}>
                                <AIPanel />
                            </Suspense>
                        </Box>
                    )}
                </Split>
            </Box>
        </ThemeProvider>
    );
}

export default Practice;
