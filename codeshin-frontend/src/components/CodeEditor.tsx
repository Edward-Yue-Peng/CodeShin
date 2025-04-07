import React, { useState, useEffect } from 'react';
import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import Editor from '@monaco-editor/react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import Split from 'react-split';

const CodeEditor: React.FC = () => {
    const theme = useTheme();
    const monacoTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light';

    // 假设当前用户 ID 固定为 1
    const userId = 1;

    // 状态：代码内容，初始为空
    const [code, setCode] = useState('');
    // 状态：终端输出和显示开关
    const [terminalOutput, setTerminalOutput] = useState('');
    const [showTerminal, setShowTerminal] = useState(false);
    // 当前题目 id，从用户上次保存的记录中获取
    const [problemId, setProblemId] = useState(0);
    // 状态：Pyodide 实例及加载状态
    const [pyodide, setPyodide] = useState<any>(null);
    const [loadingPyodide, setLoadingPyodide] = useState(true);

    // 加载 Pyodide（确保在 index.html 引入 pyodide.js）
    useEffect(() => {
        const loadPyodideAndPackages = async () => {
            setLoadingPyodide(true);
            try {
                // @ts-ignore
                const pyodideInstance = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.2/full/' });
                setPyodide(pyodideInstance);
            } catch (error) {
                console.error('Failed to load Pyodide:', error);
            }
            setLoadingPyodide(false);
        };
        loadPyodideAndPackages();
    }, []);

    // 获取用户上次保存的代码和当前题目id
    useEffect(() => {
        async function fetchLastProgress() {
            try {
                const response = await fetch(`http://localhost:8000/api/get_progress_and_code/?user_id=${userId}`);
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText);
                }
                const data = await response.json();
                setProblemId(data.current_problem_id || 0);
                setCode(data.autosave_code || '');
            } catch (error: any) {
                console.error('Failed to fetch last saved code:', error);
                setCode('');
            }
        }
        fetchLastProgress();
    }, [userId]);

    // 运行代码并显示终端结果
    const handleRunCode = async () => {
        console.log('handleRunCode called');
        if (loadingPyodide) {
            setTerminalOutput('Pyodide is loading, please wait...');
            setShowTerminal(true);
            return;
        }
        if (!pyodide) {
            setTerminalOutput('Failed to load Pyodide.');
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
            const output = await pyodide.runPythonAsync('sys.stdout.getvalue()');
            setTerminalOutput(output);
        } catch (error: any) {
            setTerminalOutput(error.toString());
        }
        setShowTerminal(true);
    };

    // 保存代码到后端（调用 /api/autosave_code/）
    const handleSaveCode = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/autosave_code/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    problem_id: problemId,
                    autosave_code: code,
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            alert('Code saved successfully!');
        } catch (error: any) {
            alert('Save failed: ' + error.message);
        }
    };

    // 下一题：简单采用 problemId + 1，然后调用 /api/problems/ 获取题目信息，并更新编辑器状态
    const handleNextProblem = async () => {
        try {
            const nextId = problemId + 1;
            const response = await fetch(`http://localhost:8000/api/problems/?id=${nextId}`);
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const data = await response.json();
            setProblemId(nextId);
            // 假设后端返回题目的默认代码字段为 default_code，否则置空
            setCode(data.default_code || '');
            setTerminalOutput('');
            setOpenFeedback(false);
        } catch (error: any) {
            alert('Failed to load next problem: ' + error.message);
        }
    };

    // 反馈弹窗（仅显示静态反馈）
    const [openFeedback, setOpenFeedback] = React.useState(false);
    const handleFeedbackOpen = () => {
        setOpenFeedback(true);
    };
    const handleFeedbackClose = () => {
        setOpenFeedback(false);
    };

    return (
        <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
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
                <IconButton size="small" color="inherit" onClick={() => setShowTerminal((prev) => !prev)}>
                    <TerminalIcon />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={handleSaveCode}>
                    <SaveIcon />
                </IconButton>
                <IconButton size="small" color="primary" sx={{ ml: 'auto' }} onClick={handleFeedbackOpen}>
                    <TaskAltIcon />
                </IconButton>
            </Box>
            {/* Main content area */}
            <Box sx={{ flexGrow: 1, height: 'calc(100% - 48px)' }}>
                {showTerminal ? (
                    <Split sizes={[80, 20]} minSize={50} direction="vertical" gutterSize={5} style={{ height: '100%' }}>
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
                                borderColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
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
            {/* Feedback Dialog */}
            <Dialog
                open={openFeedback}
                onClose={handleFeedbackClose}
                slotProps={{
                    paper: { sx: { p: 2, borderRadius: 2 } },
                }}
            >
                <DialogTitle>
                    Merge Sort Feedback <span role="img" aria-label="feedback">💡</span>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Overall, your merge sort implementation looks solid!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Strengths:</strong> Your code is well-structured and correctly implements merge sort. Great use of recursion! <span role="img" aria-label="thumbs up">👍</span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Areas for Improvement:</strong> Consider optimizing the merge process for large datasets to reduce overhead. <span role="img" aria-label="wrench">🔧</span>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={handleNextProblem}>
                        Next Problem
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CodeEditor;
