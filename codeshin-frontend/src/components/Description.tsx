// src/components/Description.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const Description: React.FC = () => {
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 题目正文 */}
            <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                <Typography variant="h5" gutterBottom>
                    Merge Sort
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Given an array of integers, implement the merge sort algorithm to sort the array in ascending order.
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
        </Box>
    );
};

export default Description;
