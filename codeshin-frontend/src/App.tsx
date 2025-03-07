// src/App.tsx
import React, { useState, useRef, lazy, Suspense } from 'react';
import Box from '@mui/material/Box';
import Split from 'react-split';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

import NavBar from './components/NavBar';
import Description from './components/Description';

const CodeEditor = lazy(() => import('./components/CodeEditor'));
const AIPanel = lazy(() => import('./components/AIPanel'));

function App() {
    const [splitSizes, setSplitSizes] = useState<number[]>([25, 50, 25]);
    const [storedThreeSizes, setStoredThreeSizes] = useState<number[]>([25, 50, 25]);
    const [aiVisible, setAiVisible] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const toggleDarkMode = () => setDarkMode((prev) => !prev);

    // 使用 MUI 主题实现暗黑模式
    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const handleToggleAIPanel = () => {
        if (aiVisible) {
            setStoredThreeSizes(splitSizes);
            const total = splitSizes[0] + splitSizes[1];
            setSplitSizes([(splitSizes[0] / total) * 100, (splitSizes[1] / total) * 100]);
            setAiVisible(false);
        } else {
            setSplitSizes(storedThreeSizes);
            setAiVisible(true);
        }
    };

    // 模拟设置菜单（如果需要）
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    // 示例菜单项（可根据需要调整）
    const pages = ['Practice', 'Home', 'Analysis', 'History'];
    const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavBar
                onToggleAIPanel={handleToggleAIPanel}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onOpenUserMenu={handleOpenUserMenu}
                pages={pages}
            />
            {/* 主内容区域填满视窗高度 */}
            <Box
                ref={containerRef}
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    height: 'calc(100vh - 64px)', // 减去 AppBar 的高度（可调整）
                }}
            >
                <Split
                    sizes={aiVisible ? splitSizes : [50, 50]}
                    minSize={100}
                    gutterSize={10}
                    direction="horizontal"
                    onDragEnd={(newSizes) => setSplitSizes(newSizes)}
                    style={{ display: 'flex', width: '100%', height: '100%' }}
                >
                    {/* 左侧：题目区 */}
                    <Box
                        sx={{
                            height: '100%',
                            overflow: 'auto',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'background.paper',
                        }}
                    >
                        <Description />
                    </Box>
                    {/* 中间：代码编辑区 */}
                    <Box sx={{ height: '100%', overflow: 'auto', backgroundColor: 'background.default' }}>
                        <Suspense fallback={<div>Loading Code Editor...</div>}>
                            <CodeEditor />
                        </Suspense>
                    </Box>
                    {/* 右侧：AI 面板（可隐藏） */}
                    {aiVisible && (
                        <Box sx={{ height: '100%', overflow: 'auto', backgroundColor: 'background.paper' }}>
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

export default App;
