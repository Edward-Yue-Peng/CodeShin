import React, { useState, useEffect, useRef, lazy, Suspense, useContext } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import Split from 'react-split';
import {
    createTheme,
    ThemeProvider,
    CssBaseline,
    Snackbar,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, Typography
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import NavBar from '../components/NavBar';
import Description from '../components/Description';
import { UserContext } from '../context/UserContext';

const CodeEditor = lazy(() => import('../components/CodeEditor'));
const AIPanel = lazy(() => import('../components/AIPanel'));

function Practice() {
    const { user } = useContext(UserContext);
    const pages = ['Practice', 'Home', 'Analysis'];
    const [code, setCode] = useState<string>("");
    const [problemID, setProblemID] = useState<number>(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [recommendedProblems, setRecommendedProblems] = useState<number[]>([]);
    const [openRecommendations, setOpenRecommendations] = useState(false);

    // 初始获取用户进度、代码和题目
    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/get_progress_and_code/?user_id=${user?.userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                console.error('请求失败，使用默认值');
                setCode("print('Hello World')");
                setProblemID(1);
                return;
            }
            const data = await response.json();
            setCode(data.autosave_code);
            setProblemID(data.current_problem_id);
        } catch (error) {
            console.error('GET 请求出错:', error);
        }
    };

    useEffect(() => {
        if (user?.userId) {
            fetchData();
        }
    }, [user]);

    // 父组件统一保存逻辑
    const handleSave = async (currentCode: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/autosave_code/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.userId,
                    problem_id: problemID,
                    autosave_code: currentCode,
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            setOpenSnackbar(true);
        } catch (error: any) {
            alert('Save failed: ' + error.message);
        }
    };

    // 统一提交代码逻辑（先提交再保存，同时弹出反馈）
    const handleSubmit = async (currentCode: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/submit_code/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.userId,
                    problem_id: problemID,
                    solution_code: currentCode,
                    is_passed: true,
                    submission_status: 'Accepted',
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const data = await response.json();
            alert(data.message || 'Code submitted successfully!');
            // 保存代码后显示反馈，此处可以进行反馈处理
            await handleSave(currentCode);
            // 此处可以设置反馈对话框的显示状态，如 setOpenFeedback(true)（自行设计）
        } catch (error: any) {
            alert('Submit failed: ' + error.message);
        }
    };

    // 统一获取推荐题目列表，并更新题目（供下一题选择）
    const handleNextProblem = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/get_recommendations/?user_id=${user?.userId}`);
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const data = await response.json();
            setRecommendedProblems(data.recommended_problems || []);
            setOpenRecommendations(true);
        } catch (error: any) {
            alert('Failed to get recommendations: ' + error.message);
        }
    };

    // 用户在推荐对话框中选择题目后，更新题目和代码（同时让 Description 重新获取题目信息）
    const handleRecommendationSelect = async (selectedId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/problems/?id=${selectedId}`);
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const data = await response.json();
            setProblemID(selectedId);
            setCode(data.default_code || '');
            setOpenRecommendations(false);
        } catch (error: any) {
            alert('Failed to load the selected problem: ' + error.message);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    // 其它布局和状态，省略 Split 和 AI panel 相关代码……
    const [splitSizes, setSplitSizes] = useState<number[]>([25, 50, 25]);
    const [aiVisible, setAiVisible] = useState(true);
    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const effectiveMode = colorMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : colorMode;
    const theme = createTheme({
        palette: {
            mode: effectiveMode,
        },
    });
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavBar
                // 将控制 AI panel、颜色模式等通过 props 传给 NavBar
                onToggleAIPanel={() => setAiVisible((prev) => !prev)}
                onChangeColorMode={setColorMode}
                pages={pages}
                currentMode={colorMode}
                username={user?.username}/>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100vh - 64px)',
                    overflow: 'hidden',
                }}
            >
                <Split
                    sizes={aiVisible ? splitSizes : [50, 50]}
                    minSize={100}
                    gutterSize={10}
                    direction="horizontal"
                    onDragEnd={(newSizes) => setSplitSizes(newSizes)}
                    style={{ display: 'flex', width: '100%', flexGrow: 1, minHeight: 0 }}
                >
                    {/* 左侧：题目信息 */}
                    <Box
                        sx={{
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            overflow: 'auto',
                            minHeight: 0,
                        }}
                    >
                        <Description problemID={problemID} />
                    </Box>
                    {/* 中间：代码编辑器 */}
                    <Box
                        sx={{
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            overflow: 'auto',
                            minHeight: 0,
                        }}
                    >
                        <Suspense fallback={<div>Loading Code Editor...</div>}>
                            <CodeEditor
                                autoSaveCode={code}
                                problemID={problemID}
                                onCodeChange={setCode}
                                onSave={handleSave}
                                onSubmit={handleSubmit}
                                onNextProblem={handleNextProblem}
                            />
                        </Suspense>
                    </Box>
                    {/* 右侧：AI 面板 */}
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

            {/* 保存成功提示 */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="info" icon={<SaveIcon fontSize="inherit" />}>
                    Auto-saved
                </Alert>
            </Snackbar>

            {/* 推荐题目选择对话框 */}
            {/* 这里展示推荐题目列表，用户选择题目后调用 handleRecommendationSelect */}
            {/* 你可以根据项目 UI 要求进一步调整 */}
            {openRecommendations && (
                <Dialog
                    open={openRecommendations}
                    onClose={() => setOpenRecommendations(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Select a Recommended Problem</DialogTitle>
                    <DialogContent>
                        {recommendedProblems && recommendedProblems.length > 0 ? (
                            recommendedProblems.map((pid) => (
                                <Button
                                    key={pid}
                                    onClick={() => handleRecommendationSelect(pid)}
                                    fullWidth
                                    sx={{ my: 1 }}
                                >
                                    Problem {pid}
                                </Button>
                            ))
                        ) : (
                            <Typography>No recommendations available.</Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenRecommendations(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            )}
        </ThemeProvider>
    );
}

export default Practice;
