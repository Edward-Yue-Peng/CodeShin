import * as React from 'react';
import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Split from 'react-split';
import Editor from '@monaco-editor/react';

// Sidebar component
interface SidebarProps {
    onCollapse: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({ onCollapse }) => {
    const menuItems = ['Practice', 'Home', 'Analysis', 'History'];
    return (
        <Box sx={{ backgroundColor: '#f5f5f5', height: '100%', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Menu</Typography>
                <IconButton size="small" onClick={onCollapse}>
                    <MenuIcon />
                </IconButton>
            </Box>
            <List>
                {menuItems.map((item) => (
                    <ListItem button key={item}>
                        <ListItemText primary={item} primaryTypographyProps={{ fontWeight: 'bold' }} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

// Description component (Merge Sort Problem)
const Description: React.FC = () => {
    return (
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Merge Sort Problem
            </Typography>
            <Typography variant="body1" gutterBottom>
                Given an array of integers, implement the merge sort algorithm to sort the array in ascending order. Merge sort is a divide and conquer algorithm that divides the array into two subarrays, recursively sorts them, and then merges them. Please write your implementation in Python.
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Example:
            </Typography>
            <Typography variant="body2" gutterBottom>
                Input: [38, 27, 43, 3, 9, 82, 10]
            </Typography>
            <Typography variant="body2">
                Output: [3, 9, 10, 27, 38, 43, 82]
            </Typography>
        </Box>
    );
};

// Code Editor component (using Monaco Editor for Python)
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
        <Box sx={{ height: '100%' }}>
            <Editor
                defaultValue={defaultCode}
                language="python"
                theme="vs-dark"
                options={{ automaticLayout: true, fontSize: 16 }}
                height="100%"
                width="100%"
            />
        </Box>
    );
};

// AI Q&A Panel component
const AIPanel: React.FC = () => {
    return (
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                AI Q&A
            </Typography>
            <Typography variant="body2">
                Here you can ask questions about merge sort or get coding suggestions.
            </Typography>
        </Box>
    );
};

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // Initialize the sizes for the three panels
    const [sizes, setSizes] = useState([25, 50, 25]);
    // Reference to the container for calculating the minimum width percentage
    const containerRef = useRef<HTMLDivElement>(null);

    // Custom gutter style
    const gutterStyle = (index: number, direction: string) => ({
        backgroundColor: '#ddd',
        cursor: 'col-resize',
        width: direction === 'horizontal' ? '12px' : undefined,
        height: direction === 'vertical' ? '12px' : undefined,
    });

    // Style for each split element to maintain height
    const elementStyle = (_: string, size: number, __: number) => ({
        flexBasis: `${size}%`,
        height: '100%',
    });

    // When the button is clicked, minimize the third panel (AI Q&A) to 50px, distributing the remaining space equally
    const handleMinimizeThird = () => {
        if (containerRef.current) {
            const width = containerRef.current.getBoundingClientRect().width;
            const minThirdPercent = (50 / width) * 100;
            const remaining = 100 - minThirdPercent;
            setSizes([remaining / 2, remaining / 2, minThirdPercent]);
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Left Sidebar */}
            {sidebarOpen ? (
                <Box sx={{ width: 220, transition: 'width 0.3s' }}>
                    <Sidebar onCollapse={() => setSidebarOpen(false)} />
                </Box>
            ) : (
                <Box
                    sx={{
                        width: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                    }}
                >
                    <IconButton onClick={() => setSidebarOpen(true)}>
                        <MenuIcon />
                    </IconButton>
                </Box>
            )}

            {/* Main area with three panels */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top toolbar */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <Button variant="contained" onClick={handleMinimizeThird}>
                        Minimize AI Q&A
                    </Button>
                </Box>
                {/* Content area */}
                <Box ref={containerRef} sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Split
                        sizes={sizes}
                        minSize={100}
                        gutterSize={10}
                        direction="horizontal"
                        onDragEnd={(newSizes) => setSizes(newSizes)}
                        style={{ display: 'flex', width: '100%', height: '100%' }}
                    >
                        <Box style={{ height: '100%', overflow: 'auto' }}>
                            <Description />
                        </Box>
                        <Box style={{ height: '100%', overflow: 'auto' }}>
                            <CodeEditor />
                        </Box>
                        <Box style={{ height: '100%', overflow: 'auto' }}>
                            <AIPanel />
                        </Box>
                    </Split>
                </Box>
            </Box>
        </Box>
    );
}
