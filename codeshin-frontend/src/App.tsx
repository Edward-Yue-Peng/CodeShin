// src/App.tsx
import React, { useState, useRef, lazy, Suspense } from 'react';
import Box from '@mui/material/Box';
import Split from 'react-split';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import NavBar from './components/NavBar';
import Description from './components/Description';

// 使用 React.lazy 懒加载
const CodeEditor = lazy(() => import('./components/CodeEditor'));
const AIPanel = lazy(() => import('./components/AIPanel'));

function App() {
    // 三栏 / 两栏布局
    const [splitSizes, setSplitSizes] = useState<number[]>([25, 50, 25]);
    const [storedThreeSizes, setStoredThreeSizes] = useState<number[]>([25, 50, 25]);
    const [aiVisible, setAiVisible] = useState(true);

    // 主题模式：'system' | 'light' | 'dark'
    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    // 使用 media query 获取系统偏好
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    // 实际使用的主题模式：若为 system，则根据 prefersDarkMode
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
            setSplitSizes([(splitSizes[0] / total) * 100, (splitSizes[1] / total) * 100]);
            setAiVisible(false);
        } else {
            setSplitSizes(storedThreeSizes);
            setAiVisible(true);
        }
    };

    // 模拟设置菜单（可根据需要扩展）
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    // 示例页面按钮（传给 NavBar）
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
            {/* 主内容区域，设置高度减去 NavBar 高度 */}
            <Box
                ref={containerRef}
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    height: 'calc(100vh - 64px)', // 根据 AppBar 高度调整
                    flexDirection: 'column',
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
                    <Box sx={{ height: '100%', overflow: 'auto', borderRight: '1px solid',borderColor: 'divider',backgroundColor: 'background.default' }}>
                        <Suspense fallback={<div>Loading Code Editor...</div>}>
                            <CodeEditor />
                        </Suspense>
                    </Box>
                    {/* 右侧：AI 面板（可隐藏） */}
                    {aiVisible && (
                        <Box sx={{ height: '100%', overflow: 'hidden', backgroundColor: 'background.paper' }}>
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
