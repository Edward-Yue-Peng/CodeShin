// src/components/CodeEditor.tsx
import React from 'react';
import { Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid } from '@mui/material';
import Editor from '@monaco-editor/react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useTheme } from '@mui/material/styles';

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

    // 状态控制反馈弹窗是否打开
    const [openFeedback, setOpenFeedback] = React.useState(false);

    // 打开反馈弹窗
    const handleFeedbackOpen = () => {
        setOpenFeedback(true);
    };

    // 关闭反馈弹窗
    const handleFeedbackClose = () => {
        setOpenFeedback(false);
    };

    // “Next Problem” 按钮点击事件
    const handleNextProblem = () => {
        console.log("Proceed to next problem");
        setOpenFeedback(false);
    };

    // “Optimize” 按钮点击事件
    const handleOptimize = () => {
        console.log("Optimize current solution");
        setOpenFeedback(false);
    };

    return (
        <Box sx={{ height: '100%', overflow: 'hidden' }}>
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
                <IconButton size="small" color="inherit">
                    <PlayArrowIcon />
                </IconButton>
                <IconButton size="small" color="inherit">
                    <TerminalIcon />
                </IconButton>
                <IconButton size="small" color="inherit">
                    <EditNoteIcon />
                </IconButton>
                <IconButton size="small" color="primary" sx={{ ml: 'auto' }} onClick={handleFeedbackOpen}>
                    <TaskAltIcon />
                </IconButton>
            </Box>
            {/* 编辑器区域 */}
            <Editor
                defaultValue={defaultCode}
                language="python"
                theme={monacoTheme}
                options={{ automaticLayout: true, fontSize: 16, minimap: { enabled: false } }}
                height="100%"
                width="100%"
            />

            {/* 反馈弹窗 */}
            <Dialog
                open={openFeedback}
                onClose={handleFeedbackClose}
                PaperProps={{ sx: { p: 2, borderRadius: 2 } }}
            >
                <DialogTitle>
                    Merge Sort Feedback <span role="img" aria-label="feedback">💡</span>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Overall, your merge sort implementation looks solid! Here are some ratings on different dimensions:
                    </Typography>
                    <Box sx={{ my: 2 }}>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <Typography variant="subtitle2">Correctness</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body2">
                                    9/10 <span role="img" aria-label="correct">✅</span>
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="subtitle2">Efficiency</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body2">
                                    7/10 <span role="img" aria-label="efficiency">⚡</span>
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="subtitle2">Readability</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body2">
                                    8/10 <span role="img" aria-label="readability">📚</span>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
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
