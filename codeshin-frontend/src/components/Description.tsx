import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';

const Description: React.FC = () => {
    const theme = useTheme();

    return (
        <Paper
            elevation={3}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                // borderRadius: 0,
                overflow: 'hidden',
                backgroundColor: theme.palette.background.paper,
                p: 2
            }}
        >
            {/* Problem Title 下面这个部分应该做成可变的！*/}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Merge Sort Algorithm
                </Typography>

                {/* Problem Introduction */}
                <Typography variant="body1" color="text.secondary" component="p" sx={{ lineHeight: 1.8 }}>
                    Merge Sort is a <strong>divide-and-conquer</strong> algorithm that recursively splits an array into two halves,
                    sorts each half, and then merges them back together in a sorted order.
                </Typography>

                {/* Algorithm Steps */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.8 }}>
                    Steps:
                </Typography>
                <Typography variant="body2" color="text.secondary" component="p" sx={{ lineHeight: 1.8 }}>
                    1️⃣ <strong>Divide</strong>: If the array length is greater than 1, split it into two halves.<br/>
                    2️⃣ <strong>Recursively Sort</strong>: Apply merge sort on both halves separately.<br/>
                    3️⃣ <strong>Merge</strong>: Combine the two sorted halves back into a single sorted array.
                </Typography>

                {/* Time Complexity */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.8 }}>
                    Time Complexity:
                </Typography>
                <Typography variant="body2" color="text.secondary" component="p" sx={{ lineHeight: 1.8 }}>
                    Merge Sort has a time complexity of <strong>O(n log n)</strong>, making it efficient for large datasets.
                    It maintains this performance even in the <strong>worst-case scenario</strong>.
                </Typography>

                {/* Example */}
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom sx={{ lineHeight: 1.8 }}>
                    Example:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, backgroundColor: theme.palette.action.hover }}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Input:</strong> [38, 27, 43, 3, 9, 82, 10]
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Output:</strong> [3, 9, 10, 27, 38, 43, 82]
                    </Typography>
                </Paper>
            </Box>
        </Paper>
    );
};

export default Description;
