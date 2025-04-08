import React, { useState, useEffect, useContext } from 'react';
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
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '@mui/material/styles';
import Split from 'react-split';
import { UserContext } from '../context/UserContext';

interface CodeEditorProps {
    autoSaveCode?: string;
    problemID?: number;
    onCodeChange?: (code: string) => void;
    onSave?: (code: string) => Promise<void>;
    onSubmit?: (code: string) => Promise<void>;
    onNextProblem?: () => Promise<void>;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
                                                   autoSaveCode,
                                                   problemID,
                                                   onCodeChange,
                                                   onSave,
                                                   onSubmit,
                                                   onNextProblem,
                                               }) => {
    const theme = useTheme();
    const monacoTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light';
    // 本地维护编辑器内容，变化时通知父组件
    const [code, setCode] = useState(autoSaveCode || '');
    useEffect(() => {
        setCode(autoSaveCode || '');
    }, [autoSaveCode]);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                handleLocalSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
    const [terminalOutput, setTerminalOutput] = useState('');
    const [showTerminal, setShowTerminal] = useState(false);
    const [pyodide, setPyodide] = useState<any>(null);
    const [loadingPyodide, setLoadingPyodide] = useState(true);

    // 加载 Pyodide
    useEffect(() => {
        const loadPyodideAndPackages = async () => {
            setLoadingPyodide(true);
            try {
                // @ts-ignore
                const pyodideInstance = await window.loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.2/full/',
                });
                setPyodide(pyodideInstance);
            } catch (error) {
                console.error('Failed to load Pyodide:', error);
            }
            setLoadingPyodide(false);
        };
        loadPyodideAndPackages();
    }, []);

    // 运行代码逻辑
    const handleRunCode = async () => {
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

    // 当编辑器内容变化时，本地更新并调用 onCodeChange 回调（若存在）
    const handleCodeChange = (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);
        if (onCodeChange) onCodeChange(newCode);
    };

    // 在子组件内部，只负责调用父组件传入的回调，这里不直接调用 API
    const handleLocalSave = async () => {
        if (onSave) await onSave(code);
    };

    const handleLocalSubmit = async () => {
        if (onSubmit) await onSubmit(code);
    };

    const handleLocalNextProblem = async () => {
        if (onNextProblem) await onNextProblem();
    };

    // 反馈对话框控制（可继续在子组件中做本地展示，如不需要可以移到父组件）
    const [openFeedback, setOpenFeedback] = useState(false);
    const handleFeedbackOpen = () => setOpenFeedback(true);
    const handleFeedbackClose = () => setOpenFeedback(false);

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
                <IconButton size="small" color="inherit" onClick={() => setShowTerminal((prev) => !prev)}>
                    <TerminalIcon />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={handleLocalSave}>
                    <SaveIcon />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={handleLocalSubmit}>
                    <SendIcon />
                </IconButton>
                <IconButton size="small" color="primary" sx={{ ml: 'auto' }} onClick={handleFeedbackOpen}>
                    <TaskAltIcon />
                </IconButton>
            </Box>

            {/* 编辑器与终端区域 */}
            <Box sx={{ flexGrow: 1, height: 'calc(100% - 48px)' }}>
                {showTerminal ? (
                    <Split sizes={[80, 20]} minSize={50} direction="vertical" gutterSize={5} style={{ height: '100%' }}>
                        <Box sx={{ height: '100%' }}>
                            <Editor
                                value={code}
                                onChange={handleCodeChange}
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
                            onChange={handleCodeChange}
                            language="python"
                            theme={monacoTheme}
                            options={{ automaticLayout: true, fontSize: 16, minimap: { enabled: false } }}
                            height="100%"
                            width="100%"
                        />
                    </Box>
                )}
            </Box>

            {/* 反馈对话框（仅为示例，反馈内容可由父组件控制并统一） */}
            <Dialog open={openFeedback} onClose={handleFeedbackClose} slotProps={{ paper: { sx: { p: 2, borderRadius: 2 } } }}>
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
                    <Button variant="outlined" onClick={handleLocalNextProblem}>
                        Next Problem
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CodeEditor;
