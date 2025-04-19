// src/pages/Practice.tsx
import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { Box, Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress } from '@mui/material';
import Split from 'react-split';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import NavBar from '../components/NavBar';
import Description, { ProblemData } from '../components/Description';
import { UserContext } from '../context/UserContext';
const CodeEditor = lazy(() => import('../components/CodeEditor'));
const AIPanel = lazy(() => import('../components/AIPanel'));
// 后端的API地址，在.env文件中配置
const API_URL = import.meta.env.VITE_API_BASE_URL;

function Practice() {
    const { user } = useContext(UserContext);
    const pages = ['Practice', 'Home', 'History'];
    const [code, setCode] = useState<string>("");
    const [problemID, setProblemID] = useState<number>(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [recommendedProblems, setRecommendedProblems] = useState<ProblemData[]>([]);
    const [feedback, setFeedback] = useState<string>("");
    const [score, setScore] = useState<number>(-1);
    const [openRecommendations, setRecommendations] = useState(false);
    const [openFeedback, setOpenFeedback] = useState(false);
    const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);

    const [problem, setProblem] = useState<ProblemData | null>(null);
    const [loadingProblem, setLoadingProblem] = useState<boolean>(false);
    const [problemError, setProblemError] = useState<string>('');

    // 初始获取用户进度、代码和题目
    const fetchUserData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/get_progress_and_code/?user_id=${user?.userId}`, {
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
    // 当用户加载的时候自动获取进度
    useEffect(() => {
        if (user?.userId) {
            fetchUserData();
        }
    }, [user]);

    // 从题目ID获得题目信息
    useEffect(() => {
        if (!problemID) {
            setProblem(null);
            setProblemError('');
            return;
        }
        fetchProblemDetail(problemID);
    }, [problemID]);
    async function fetchProblemDetail(pid: number) {
        setLoadingProblem(true);
        setProblemError('');
        try {
            const res = await fetch(`${API_URL}/api/problems/?id=${pid}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            const data: ProblemData = await res.json();
            setProblem(data);
        } catch (err: any) {
            setProblemError(err.message || 'Failed to load problem');
            setProblem(null);
        } finally {
            setLoadingProblem(false);
        }
    }

    // 保存代码
    const handleSave = async (currentCode: string) => {
        try {
            const response = await fetch(`${API_URL}/api/autosave_code/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.userId,
                    problem_id: problemID,
                    autosave_code: currentCode || " ",
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

    // 用户发送消息给AI
    const handleSendAIPanelMessage = async (message: string): Promise<string> => {
        try {
            const payload = {
                user_id: user?.userId,
                problem_id: problemID,
                message,
                code: code || '',
            };
            const response = await fetch(`${API_URL}/api/gpt_interaction/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return `Error: ${errorData.error}`;
            } else {
                const data = await response.json();
                return data.gpt_reply;
            }
        } catch (error: any) {
            return `Error: ${error.message}`;
        }
    };

    // TODO 重写
    // 用户在推荐对话框中选择题目后，更新题目和代码
    const handleRecommendationSelect = async (selectedId: number) => {
        try {
            const response = await fetch(`${API_URL}/api/problems/?id=${selectedId}`);
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const data = await response.json();
            setProblemID(selectedId);
            setCode(data.default_code || '');
            setRecommendations(false);
            setOpenFeedback(false);
        } catch (error: any) {
            alert('Failed to load the selected problem: ' + error.message);
        }
    };

    // 获取单个题目详情
    async function fetchSingleProblemDetail(pid: number): Promise<ProblemData> {
        const res = await fetch(`${API_URL}/api/problems/?id=${pid}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }


    // 提交代码
    const handleSubmit = async () => {
        setOpenFeedback(true);
        // 先搞个反馈动画
        setLoadingFeedback(true);
        try {
            const response = await fetch(`${API_URL}/api/submit_code/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.userId,
                    problem_id: problemID,
                    solution_code: code || ' ',
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }

            const data = await response.json();
            setFeedback(data.feedback || '');
            setScore(data.score);
        } catch (error: any) {
            alert("Submission failed: " + error.message);
        } finally {
            setLoadingFeedback(false);
        }
    };

    // 获得推荐题目
    const handleRecommendations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/call_recommender/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.userId,
                    problem_id: problemID,
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const data: { recommendations: number[] } = await response.json();
            const details: ProblemData[] = await Promise.all(
                data.recommendations.map((pid) => fetchSingleProblemDetail(pid))
            );
            setRecommendedProblems(details);
            setRecommendations(true);
        } catch (error: any) {
            alert('Failed to load recommendations: ' + error.message);
        }
    };

    // 布局相关状态
    const [splitSizes, setSplitSizes] = useState<number[]>([25, 50, 25]);
    const [aiVisible, setAiVisible] = useState(true);
    const [colorMode, setColorMode] = useState<'system' | 'light' | 'dark'>('system');
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
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
                        <Description
                            problem={problem}
                            loading={loadingProblem}
                            error={problemError}
                        />
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
                                onSubmit={handleSubmit}
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
                                <AIPanel onSendMessage={handleSendAIPanelMessage} />
                            </Suspense>
                        </Box>
                    )}
                </Split>
            </Box>

            {/* 保存成功弹窗 */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={()=>setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={()=>setOpenSnackbar(false)} severity="info">
                    Saved
                </Alert>
            </Snackbar>

            {/* 提交后的反馈对话框 */}
            <Dialog
                open={openFeedback}
                onClose={() => setOpenFeedback(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    <span role="img" aria-label="feedback">💡</span>Feedback of {problem?.title}
                </DialogTitle>
                <DialogContent dividers>
                    {/*反馈动画*/}
                    {loadingFeedback ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {feedback}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>The score you gained: </strong> {score}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={() => setOpenFeedback(false)}
                        disabled={loadingFeedback}
                    >
                        Revise
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setOpenFeedback(false);
                            handleRecommendations();
                        }}
                        disabled={loadingFeedback}
                    >
                        Next Problem
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 推荐题目选择弹窗 */}
            <Dialog
                open={openRecommendations}
                onClose={() => setRecommendations(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Select a Recommended Problem</DialogTitle>
                <DialogContent>
                    {recommendedProblems && recommendedProblems.length > 0 ? (
                        recommendedProblems.map((p) => (
                            <Button
                                key={p.id}
                                onClick={() => handleRecommendationSelect(p.id)}
                                fullWidth
                                sx={{ my: 1 }}
                            >
                                Problem {p.id}: {p.title}
                            </Button>
                        ))
                    ) : (
                        <Typography>No recommendations available.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRecommendations(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}

export default Practice;