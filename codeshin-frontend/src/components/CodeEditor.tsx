// src/components/CodeEditor.tsx
import React from 'react';
import { Box, IconButton } from '@mui/material';
import Editor from '@monaco-editor/react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PublishIcon from '@mui/icons-material/Publish';

const CodeEditor: React.FC = () => {
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
                <IconButton size="small" color="primary" sx={{ ml: 'auto' }}>
                    <PublishIcon />
                </IconButton>
            </Box>
            {/* 编辑器区域 */}
            <Editor
                defaultValue={defaultCode}
                language="python"
                theme="vs-light"
                options={{ automaticLayout: true, fontSize: 16 }}
                height="100%"
                width="100%"
            />
        </Box>
    );
};

export default CodeEditor;
