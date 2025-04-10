// src/components/AIPanel.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const AIPanel: React.FC = () => {
    const theme = useTheme();
    // 根据当前模式决定 bot 消息气泡的背景色
    const botBubbleColor = theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300';

    const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
        { sender: 'bot', text: 'Hello! How can I help you today?' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // 发送消息并调用后端 API
    const handleSend = async () => {
        if (!input.trim() || loading) return;

        // 先将用户的消息加入聊天记录
        setMessages(prev => [...prev, { sender: 'user', text: input }]);
        setLoading(true);

        const payload = {
            user_id: 1,
            problem_id: 42,
            message: input,
        };

        try {
            const response = await fetch(`${apiUrl}/api/gpt_interaction/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                // 如果返回错误，读取错误信息
                const errorData = await response.json();
                setMessages(prev => [
                    ...prev,
                    { sender: 'bot', text: `Error: ${errorData.error}` },
                ]);
            } else {
                const data = await response.json();
                // 将 GPT 返回的回复信息加入聊天记录
                setMessages(prev => [
                    ...prev,
                    { sender: 'bot', text: data.gpt_reply },
                ]);
            }
        } catch (error: any) {
            // 网络或其他异常处理
            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: `Error: ${error.message}` },
            ]);
        } finally {
            setLoading(false);
            setInput('');
        }
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
            </Box>
            {/* 输入区 */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            setInput("");
                            handleSend();
                        }
                    }}
                />
                <Button variant="contained" sx={{ ml: 1 }} onClick={(e) => {setInput("");handleSend()}} disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </Button>
            </Box>
        </Box>
    );
};

export default AIPanel;
