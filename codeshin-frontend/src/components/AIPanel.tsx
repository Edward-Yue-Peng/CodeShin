// src/components/AIPanel.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AIPanel: React.FC = () => {
    const theme = useTheme();
    // 根据当前模式决定 bot 消息气泡的背景色
    const botBubbleColor = theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300';

    const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
        { sender: 'bot', text: 'Hello! How can I help you today?' },
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [
            ...prev,
            { sender: 'user', text: input },
            { sender: 'bot', text: 'This is a demo response.' },
        ]);
        setInput('');
    };

    const handleClear = () => {
        setMessages([]);
    };

    const handleSamplePrompt = () => {
        setInput('Explain the merge sort algorithm.');
    };

    const handleNewChat = () => {
        setMessages([]);
        setInput('');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 标题区域 */}
            <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" align="center">CodeShinAI</Typography>
            </Box>
            {/* 聊天记录 */}
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', backgroundColor: 'background.default' }}>
                {messages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    return (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                justifyContent: isUser ? 'flex-end' : 'flex-start',
                                mb: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    maxWidth: '70%',
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: isUser ? 'primary.main' : botBubbleColor,
                                    color: isUser ? 'primary.contrastText' : 'text.primary',
                                }}
                            >
                                <Typography variant="body2">{msg.text}</Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            {/* 快捷操作按钮 */}
            <Box
                sx={{
                    p: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 1,
                }}
            >
                <Button variant="outlined" size="small" onClick={handleNewChat}>
                    NEW CHAT
                </Button>
                <Button variant="outlined" size="small" onClick={handleSamplePrompt}>
                    HINT
                </Button>
                <Button variant="outlined" size="small" onClick={handleClear}>
                    CLEAR
                </Button>
            </Box>
            {/* 输入区 */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={input}
                    onSubmit={handleSend}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                />
                <Button variant="contained" sx={{ ml: 1 }} onClick={handleSend}>
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default AIPanel;
