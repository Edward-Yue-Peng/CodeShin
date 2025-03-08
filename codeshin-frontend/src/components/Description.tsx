// src/components/Description.tsx
import React from 'react';
import {Box, IconButton, Typography} from '@mui/material';
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TerminalIcon from "@mui/icons-material/Terminal";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PublishIcon from "@mui/icons-material/Publish";
import Button from "@mui/material/Button";

const Description: React.FC = () => {
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
                sx={{
                    p: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 1,
                }}
            >
                <Button variant="outlined" size="small">
                    SUBMIT
                </Button>
                <IconButton size="small" color="primary" sx={{ ml: 'auto' }}>
                    <PublishIcon />
                </IconButton>
            </Box>
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
