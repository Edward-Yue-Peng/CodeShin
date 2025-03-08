// src/components/CodeEditor.tsx
import React from 'react';
import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid2
} from '@mui/material';
import Editor from '@monaco-editor/react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useTheme } from '@mui/material/styles';
import Split from 'react-split';

const CodeEditor: React.FC = () => {
    const theme = useTheme();
    const monacoTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light';

    const defaultCode = `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

if __name__ == '__main__':
    arr = [38, 27, 43, 3, 9, 82, 10]
    print("Sorted array:", merge_sort(arr))`;

    // 状态：反馈弹窗
    const [openFeedback, setOpenFeedback] = React.useState(false);
    // 状态：代码内容
    const [code, setCode] = React.useState(defaultCode);
    // 状态：终端输出和显示开关
    const [terminalOutput, setTerminalOutput] = React.useState('');
    const [showTerminal, setShowTerminal] = React.useState(false);
    // 状态：Pyodide 实例及加载状态
    const [pyodide, setPyodide] = React.useState<any>(null);
    const [loadingPyodide, setLoadingPyodide] = React.useState(true);

    // 加载 Pyodide（请确保已在 index.html 引入 pyodide.js）
    React.useEffect(() => {
        const loadPyodideAndPackages = async () => {
            setLoadingPyodide(true);
            try {
                // @ts-ignore
                const pyodideInstance = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/" });
                setPyodide(pyodideInstance);
            } catch (error) {
                console.error("加载 Pyodide 失败:", error);
            }
            setLoadingPyodide(false);
        };
        loadPyodideAndPackages();
    }, []);

    // 运行代码并显示终端结果
    const handleRunCode = async () => {
        console.log("handleRunCode 被调用");
        if (loadingPyodide) {
            setTerminalOutput("Pyodide is loading, please wait...");
            setShowTerminal(true);
            return;
        }
        if (!pyodide) {
            setTerminalOutput("Failed to load Pyodide.");
            setShowTerminal(true);
            return;
        }
        try {
            await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
            `);
            await pyodide.runPythonAsync(code);
            const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
            setTerminalOutput(output);
        } catch (error: any) {
            setTerminalOutput(error.toString());
        }
        setShowTerminal(true);
    };

    // 反馈弹窗相关函数
    const handleFeedbackOpen = () => {
        setOpenFeedback(true);
    };

    const handleFeedbackClose = () => {
        setOpenFeedback(false);
    };

    const handleNextProblem = () => {
        console.log("Proceed to next problem");
        setOpenFeedback(false);
    };

    const handleOptimize = () => {
        console.log("Optimize current solution");
        setOpenFeedback(false);
    };

    return (
        <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* 工具栏 */}
            <Box
                sx={{
                    p: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 1,
                }}
            >
                <IconButton size="small" color="inherit" onClick={handleRunCode}>
                    <PlayArrowIcon />
                </IconButton>
                {/* 点击 Terminal 图标切换终端显示 */}
                <IconButton size="small" color="inherit" onClick={() => setShowTerminal(prev => !prev)}>
                    <TerminalIcon />
                </IconButton>
                <IconButton size="small" color="inherit">
                    <EditNoteIcon />
                </IconButton>
                <IconButton size="small" color="primary" sx={{ ml: 'auto' }} onClick={handleFeedbackOpen}>
                    <TaskAltIcon />
                </IconButton>
            </Box>
            {/* 主体内容区域 */}
            <Box sx={{ flexGrow: 1, height: 'calc(100% - 48px)' }}>
                {showTerminal ? (
                    <Split
                        sizes={[80, 20]}
                        minSize={50}
                        direction="vertical"
                        gutterSize={5}
                        style={{ height: '100%' }}
                    >
                        <Box sx={{ height: '100%' }}>
                            <Editor
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                language="python"
                                theme={monacoTheme}
                                options={{ automaticLayout: true, fontSize: 16, minimap: { enabled: false } }}
                                height="100%"
                                width="100%"
                            />
                        </Box>
                        <Box
                            sx={{
                                p: 1,
                                backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
                                color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                borderTop: '1px solid',
                                borderColor: theme.palette.mode == 'dark' ? '#121212' : '#f5f5f5',
                                overflow: 'auto',
                            }}
                        >
                            {terminalOutput}
                        </Box>
                    </Split>
                ) : (
                    <Box sx={{ height: '100%' }}>
                        <Editor
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            language="python"
                            theme={monacoTheme}
                            options={{ automaticLayout: true, fontSize: 16, minimap: { enabled: false } }}
                            height="100%"
                            width="100%"
                        />
                    </Box>
                )}
            </Box>
            {/* 反馈弹窗 */}
            <Dialog
                open={openFeedback}
                onClose={handleFeedbackClose}
                slotProps={{
                    paper: {sx: { p: 2, borderRadius: 2 }}}}
            >
                <DialogTitle>
                    Merge Sort Feedback <span role="img" aria-label="feedback">💡</span>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Overall, your merge sort implementation looks solid! Here are some ratings on different dimensions:
                    </Typography>
                    <Box sx={{ my: 2 }}>
                        <Grid2 container spacing={1}>
                            <Grid2 columns={4}>
                                <Typography variant="subtitle2">Correctness</Typography>
                            </Grid2>
                            <Grid2 columns={8}>
                                <Typography variant="body2">
                                    9/10 <span role="img" aria-label="correct">✅</span>
                                </Typography>
                            </Grid2>
                            <Grid2 columns={4}>
                                <Typography variant="subtitle2">Efficiency</Typography>
                            </Grid2>
                            <Grid2 columns={8}>
                                <Typography variant="body2">
                                    7/10 <span role="img" aria-label="efficiency">⚡</span>
                                </Typography>
                            </Grid2>
                            <Grid2 columns={4}>
                                <Typography variant="subtitle2">Readability</Typography>
                            </Grid2>
                            <Grid2 columns={8}>
                                <Typography variant="body2">
                                    8/10 <span role="img" aria-label="readability">📚</span>
                                </Typography>
                            </Grid2>
                        </Grid2>
                    </Box>

                    <Typography variant="body2" color="text.secondary" component="p">
                        <strong>Strengths:</strong> Your code is well-structured and correctly implements merge sort. Great use of recursion! <span role="img" aria-label="thumbs up">👍</span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Areas for Improvement:</strong> Consider optimizing the merge process for large datasets. A slight refactor might reduce overhead. <span role="img" aria-label="wrench">🔧</span>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={handleNextProblem}>
                        Next Problem
                    </Button>
                    <Button variant="contained" onClick={handleOptimize}>
                        Optimize
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CodeEditor;
