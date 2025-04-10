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
    DialogActions,
    Typography
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
    const [openFeedback, setOpenFeedback] = useState(false);

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

    // 获取推荐题目列表，随后打开推荐题目选择对话框
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

    // 用户在推荐对话框中选择题目后，更新题目和代码
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
            setOpenFeedback(false);
        } catch (error: any) {
            alert('Failed to load the selected problem: ' + error.message);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    // 修改后的 TaskAltIcon 按钮点击处理函数：
    // 1. 提交代码到 /api/submit_code/ 接口；
    // 2. 如果提交成功，则切换到下一道题（展示推荐题目对话框供用户选择）。
    const handleTaskAltClick = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/submit_code/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({user_id: 1,problem_id: 1,solution_code: "1",})
            });
            console.log("Will send:", JSON.stringify({user_id: 1,problem_id: 1,solution_code: "1",}));
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const data = await response.json();
            console.log("Submission successful:", data);
            // 可在此处根据返回的 data 显示额外信息（例如得分、反馈等）
            setOpenSnackbar(true);  // 提交成功后显示提示
            // 切换到下一道题（这里调用 handleNextProblem 获取推荐题目）
            await handleNextProblem();
        } catch (error: any) {
            alert("Submission failed: " + error.message);
        }
    };

    // 布局相关状态
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
                onToggleAIPanel={() => setAiVisible((prev) => !prev)}
                onChangeColorMode={setColorMode}
                pages={pages}
                currentMode={colorMode}
                username={user?.username}
            />
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
                                onCodeChange={setCode}
                                onSave={handleSave}
                                onTaskAltClick={handleTaskAltClick} // 将新的回调传递给 CodeEditor
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
                    Saved
                </Alert>
            </Snackbar>

            {/* 反馈对话框 */}
            <Dialog
                open={openFeedback}
                onClose={() => setOpenFeedback(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Merge Sort Feedback <span role="img" aria-label="feedback">💡</span>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Overall, your merge sort implementation looks solid!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Strengths:</strong> Your code is well-structured and correctly implements merge sort.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Areas for Improvement:</strong> Consider optimizing the merge process for large datasets.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={async () => {
                            await handleNextProblem();
                            setOpenFeedback(false);
                        }}
                    >
                        Next Problem
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 推荐题目选择弹窗 */}
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
        </ThemeProvider>
    );
}

export default Practice;
