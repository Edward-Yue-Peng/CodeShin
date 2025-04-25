// src/components/CodeEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
} from '@mui/material';
import Editor, { OnMount } from '@monaco-editor/react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import SaveIcon from '@mui/icons-material/Save';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useTheme } from '@mui/material/styles';
import Split from 'react-split';

interface CodeEditorProps {
    autoSaveCode?: string;
    onCodeChange?: (code: string) => void;
    onSave?: (code: string) => Promise<void>;
    onSubmit?: () => void;
    onAsk?: (question: string, codeSnippet: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
                                                   autoSaveCode,
                                                   onCodeChange,
                                                   onSave,
                                                   onSubmit,
                                                   onAsk,
                                               }) => {
    const theme = useTheme();
    const monacoTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light';
    const [code, setCode] = useState(autoSaveCode || '');
    const codeRef = useRef<string>(code);

    // Monaco editor ref & selection
    const editorRef = useRef<any>(null);
    const [hasSelection, setHasSelection] = useState(false);
    const selectedCodeRef = useRef<string>('');

    // Ask dialog state
    const [openAsk, setOpenAsk] = useState(false);
    const [question, setQuestion] = useState('');

    useEffect(() => {
        setCode(autoSaveCode || '');
    }, [autoSaveCode]);

    useEffect(() => {
        codeRef.current = code;
    }, [code]);

    // Ctrl+S save
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                onSave && onSave(codeRef.current);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSave]);

    // Pyodide setup...
    const [terminalOutput, setTerminalOutput] = useState('');
    const [showTerminal, setShowTerminal] = useState(false);
    const [pyodide, setPyodide] = useState<any>(null);
    const [loadingPyodide, setLoadingPyodide] = useState(true);

    useEffect(() => {
        (async () => {
            setLoadingPyodide(true);
            try {
                // @ts-ignore
                const py = await window.loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.2/full/',
                });
                setPyodide(py);
            } catch (e) {
                console.error('Failed to load Pyodide:', e);
            }
            setLoadingPyodide(false);
        })();
    }, []);

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
        } catch (e: any) {
            setTerminalOutput(e.toString());
        }
        setShowTerminal(true);
    };

    const handleCodeChange = (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);
        onCodeChange && onCodeChange(newCode);
    };

    const handleLocalSave = async () => {
        onSave && await onSave(code);
    };

    // editor mount to wire selection listener
    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor;
        editor.onDidChangeCursorSelection((e) => {
            const sel = editor.getModel()?.getValueInRange(e.selection) || '';
            selectedCodeRef.current = sel;
            setHasSelection(sel.trim().length > 0);
        });
    };

    const openAskDialog = () => {
        setQuestion('');
        setOpenAsk(true);
    };
    const closeAskDialog = () => {
        setOpenAsk(false);
    };
    const sendAsk = () => {
        if (onAsk && selectedCodeRef.current.trim()) {
            onAsk(question, selectedCodeRef.current);
            setOpenAsk(false);
        }
    };

    return (
        <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* toolbar */}
            <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={handleRunCode}><PlayArrowIcon /></IconButton>
                <IconButton size="small" onClick={() => setShowTerminal(prev => !prev)}><TerminalIcon /></IconButton>
                <IconButton size="small" onClick={handleLocalSave}><SaveIcon /></IconButton>
                <Tooltip title={hasSelection ? "Ask about selection" : "Select code first"}>
                    <span>
                        <IconButton
                            size="small"
                            color={hasSelection ? 'primary' : 'default'}
                            disabled={!hasSelection}
                            onClick={openAskDialog}
                        >
                            <QuestionAnswerIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Button size="small" color="primary" variant="outlined" sx={{ ml: 'auto' }} onClick={() => onSubmit && onSubmit()}>
                    SUBMIT
                </Button>
            </Box>

            {/* editor & terminal */}
            <Box sx={{ flexGrow: 1, height: 'calc(100% - 48px)' }}>
                {showTerminal ? (
                    <Split sizes={[80, 20]} minSize={50} direction="vertical" gutterSize={5} style={{ height: '100%' }}>
                        <Box sx={{ height: '100%' }}>
                            <Editor
                                theme={monacoTheme}
                                language="python"
                                value={code}
                                onMount={handleEditorMount}
                                onChange={handleCodeChange}
                                options={{ automaticLayout: true, fontSize: 16, minimap: { enabled: false } }}
                                height="100%"
                                width="100%"
                            />
                        </Box>
                        <Box
                            sx={{
                                p: 1,
                                backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
                                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
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
                            theme={monacoTheme}
                            language="python"
                            value={code}
                            onMount={handleEditorMount}
                            onChange={handleCodeChange}
                            options={{ automaticLayout: true, fontSize: 16, minimap: { enabled: false } }}
                            height="100%"
                            width="100%"
                        />
                    </Box>
                )}
            </Box>

            {/* Ask Dialog */}
            <Dialog open={openAsk} onClose={closeAskDialog} fullWidth maxWidth="sm">
                <DialogTitle>Ask about selected code</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your question"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAskDialog}>Cancel</Button>
                    <Button onClick={sendAsk} disabled={!question.trim()}>Send</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CodeEditor;
