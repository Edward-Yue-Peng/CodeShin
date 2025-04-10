import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    Box,
    IconButton,
} from '@mui/material';
import Editor from '@monaco-editor/react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import Split from 'react-split';

interface CodeEditorProps {
    autoSaveCode?: string;
    onCodeChange?: (code: string) => void;
    onSave?: (code: string) => Promise<void>;
    onTaskAltClick?: () => void;  // 新增的回调属性，用于 TaskAltIcon 按钮点击
}

const CodeEditor: React.FC<CodeEditorProps> = ({
                                                   autoSaveCode,
                                                   onCodeChange,
                                                   onSave,
                                                   onTaskAltClick,
                                               }) => {
    const theme = useTheme();
    const monacoTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light';

    const [code, setCode] = useState(autoSaveCode || '');
    const codeRef = useRef<string>(code);

    useEffect(() => {
        setCode(autoSaveCode || '');
    }, [autoSaveCode]);

    // 每次 code 更新时，同步更新 ref
    useEffect(() => {
        codeRef.current = code;
    }, [code]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                if (onSave) onSave(codeRef.current);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onSave]);

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

    // 当编辑器内容变化时，更新本地状态并调用 onCodeChange（若存在）
    const handleCodeChange = (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);
        if (onCodeChange) onCodeChange(newCode);
    };

    // 子组件内部调用父组件传入的回调
    const handleLocalSave = async () => {
        if (onSave) await onSave(code);
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
                <IconButton size="small" color="inherit" onClick={() => setShowTerminal((prev) => !prev)}>
                    <TerminalIcon />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={handleLocalSave}>
                    <SaveIcon />
                </IconButton>
                {/* 修改 TaskAltIcon 按钮，点击时调用父组件传入的 onTaskAltClick */}
                <IconButton
                    size="small"
                    color="primary"
                    sx={{ ml: 'auto' }}
                    onClick={() => {
                        if (onTaskAltClick) onTaskAltClick();
                    }}
                >
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
        </Box>
    );
};

export default CodeEditor;
