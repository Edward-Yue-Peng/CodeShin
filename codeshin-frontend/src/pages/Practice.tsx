// src/Practice.tsx

import React, {useState, useRef, lazy, Suspense, useEffect} from 'react';
import Box from '@mui/material/Box';
import Split from 'react-split';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import NavBar from '../components/NavBar';
import Description from '../components/Description';

// === 新增 import ===
import { Snackbar, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const CodeEditor = lazy(() => import('../components/CodeEditor'));
const AIPanel = lazy(() => import('../components/AIPanel'));

function Practice() {
    // 新增：Snackbar 的开关状态
    const [openSnackbar, setOpenSnackbar] = useState(false);

    // 当按下 Ctrl+S 或 Cmd+S 时，弹出自定义保存提示
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault();
                // 原先的 alert 替换为调用自定义函数
                handleShowSaveNotification();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // 新增：打开 Snackbar 的函数
    const handleShowSaveNotification = () => {
        setOpenSnackbar(true);
    };

    // 新增：关闭 Snackbar 的函数
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

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
                    style={{ display: 'flex', width: '100%', flexGrow: 1, height: '100%', minHeight: 0 }}
                >
                    {/* Left Pane */}
                    <Box
                        sx={{
                            borderRight: '1px solid',
                            borderColor: 'divider',
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

            {/* Snackbar + Alert：3秒后自动关闭，右上角显示 */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="info"
                    icon={<SaveIcon fontSize="inherit" />}
                >
                    Auto-saved
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}

export default Practice;
