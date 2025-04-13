// src/components/AIPanel.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';

interface AIPanelProps {
    onSendMessage: (message: string) => Promise<string>;
}

const AIPanel: React.FC<AIPanelProps> = ({ onSendMessage }) => {
    const theme = useTheme();
    const botBubbleColor = theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300';

    const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
        { sender: 'bot', text: 'Hello! How can I help you today?' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        // （可选）若需要在发送时清空对话框
        // setMessages([]);
        setInput('');
        // 先加入用户消息
        setMessages((prev) => [...prev, { sender: 'user', text: input }]);
        setLoading(true);

        try {
            const reply = await onSendMessage(input);
            setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
        } catch (error: any) {
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: `Error: ${error.message}` },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setInput('');
    };

    const handleSamplePrompt = () => {
        setInput('Explain the merge sort algorithm.');
    };


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 标题区域 */}
            <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" align="center">CodeShinAI</Typography>
            </Box>
            {/* 聊天记录区域 */}
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', backgroundColor: 'background.default' }}>
                {messages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    // @ts-ignore
                    // @ts-ignore
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
                                    bgcolor: isUser ? 'primary.main' : (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'),
                                    color: isUser ? 'primary.contrastText' : theme.palette.text.primary,
                                    wordBreak: 'break-word',      // 对长单词进行换行
                                    overflowWrap: 'break-word',   // 支持旧版浏览器
                                    whiteSpace: 'pre-wrap',       // 保留换行符并允许自动换行
                                }}
                            >
                                {msg.sender === 'bot' ? (
                                    <Box sx={{ typography: 'body2', color: theme.palette.text.primary }}>
                                        <ReactMarkdown
                                            components={{
                                                // 内联代码和代码块
                                                code({ node, inline, className, children, ...props }) {
                                                    return inline ? (
                                                        <code
                                                            style={{
                                                                background: theme.palette.mode === 'dark' ? "#2e2e2e" : "#f5f5f5",
                                                                padding: "0.2em 0.4em",
                                                                borderRadius: "3px",
                                                                wordBreak: "break-word",
                                                            }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <pre
                                                            style={{
                                                                overflowX: 'auto',        // 遇到过长的代码出现滚动条
                                                                wordBreak: 'break-all',    // 允许在任何地方换行
                                                                whiteSpace: 'pre-wrap',    // 保留换行符
                                                                maxWidth: '100%',          // 限制最大宽度，始终在容器内
                                                                background: theme.palette.mode === 'dark' ? "#2e2e2e" : "#f5f5f5",
                                                                padding: "0.5em",
                                                                borderRadius: "5px",
                                                            }}
                                                        >
                            <code {...props}>{children}</code>
                          </pre>
                                                    );
                                                },
                                                // 图片渲染
                                                img({ node, ...props }) {
                                                    return <img style={{ maxWidth: '100%', height: 'auto' }} {...props} />;
                                                },
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </Box>
                                ) : (
                                    <Typography variant="body2">{msg.text}</Typography>
                                )}
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
                            handleSend();
                        }
                    }}
                />
                <Button variant="contained" sx={{ ml: 1 }} onClick={handleSend} disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </Button>
            </Box>
        </Box>
    );
};

export default AIPanel;
