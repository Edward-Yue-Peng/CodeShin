// src/components/AIPanel.tsx
// AI面板组件
import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
    oneDark,
    oneLight
} from 'react-syntax-highlighter/dist/esm/styles/prism';

// 具体的API请求和处理逻辑在父组件中实现
interface AIPanelProps {
    onSendMessage: (message: string) => Promise<string>;
}

const AIPanel: React.FC<AIPanelProps> = ({ onSendMessage }) => {
    const theme = useTheme();
    // 根据主题模式动态设置 bot 气泡背景
    const botBubbleColor =
        theme.palette.mode === 'dark'
            ? theme.palette.grey[800]
            : theme.palette.grey[200];
    // 根据主题模式动态选择代码高亮风格
    const codeStyle = theme.palette.mode === 'dark' ? oneDark : oneLight;
    // 初始消息
    const [messages, setMessages] = useState<
        { sender: 'bot' | 'user'; text: string }[]
    >([{ sender: 'bot', text: 'Hello! How can I help you today?' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        // 添加用户消息，还有AI的占位消息
        setMessages(prev => [
            ...prev,
            { sender: 'user', text: input },
            { sender: 'bot',  text: 'I am thinking...' }
        ]);
        setInput('');
        setLoading(true);
        try {
            const reply = await onSendMessage(input);
            // 收到回复后，用真正内容替换那条消息
            setMessages(prev => {
                const idx = prev.length - 1;
                const newMsgs = [...prev];
                newMsgs[idx] = { sender: 'bot', text: reply };
                return newMsgs;
            });
        } catch (error: any) {
            setMessages(prev => {
                const idx = prev.length - 1;
                const newMsgs = [...prev];
                newMsgs[idx] = { sender: 'bot', text: `Error: ${error.message}` };
                return newMsgs;
            });
        } finally {
            setLoading(false);
        }
    };

    // 清空聊天记录，但是现在只是前端清空
    const handleNewChat = () => {
        setMessages([]);
        setInput('');
    };

    // 预设Prompt，TODO，待完善
    const handleSamplePrompt = () => {
        setInput('Give me some hints.');
    };

    // ReactMarkdown 自定义组件
    const markdownComponents: Components = {
        ol({ children, ...props }) {
            return (
                <Box
                    component="ol"
                    sx={{ pl: 2, m: 0 }}
                    {...props}
                >
                    {children}
                </Box>
            );
        },
        ul({ children, ...props }) {
            return (
                <Box
                    component="ul"
                    sx={{ pl: 2, m: 0 }}
                    {...props}
                >
                    {children}
                </Box>
            );
        },
        li({ children, ...props }) {
            return (
                <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.5 }}
                    {...props}
                >
                    {children}
                </Typography>
            );
        },
        pre({children }) {
            const codeElement = React.Children.only(children) as React.ReactElement<{
                className?: string;
                children: React.ReactNode;
            }>;
            const match = /language-(\w+)/.exec(codeElement.props.className || '');
            if (match) {
                // 检测到编程语言，进行高亮
                return (
                    <SyntaxHighlighter
                        style={codeStyle}
                        language={match[1]}
                        PreTag="div"
                    >
                        {String(codeElement.props.children).trim()}
                    </SyntaxHighlighter>
                );
            }
            // 返回普通样式
            return <pre>{children}</pre>;
        },
        code({ node, className, children, ...props }) {
            // 行内代码或无语言标记的 code
            return (
                <code
                    className={className}
                    {...props}
                    style={{
                        background:
                            theme.palette.mode === 'dark' ? '#2e2e2e' : '#f5f5f5',
                        padding: '0.2em 0.4em',
                        borderRadius: '3px',
                        wordBreak: 'break-word'
                    }}
                >
                    {children}
                </code>
            );
        },
        img({ node, ...props }) {
            return (
                <img
                    alt={"a picture"}
                    style={{ maxWidth: '100%', height: 'auto' }}
                    {...props}
                />
            );
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 标题 */}
            <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" align="center">
                    CodeShinAI
                </Typography>
            </Box>

            {/* 聊天记录 */}
            <Box
                sx={{
                    flexGrow: 1,
                    p: 2,
                    overflowY: 'auto',
                    backgroundColor: 'background.default'
                }}
            >
                {messages.map((msg, idx) => {
                    const isUser = msg.sender === 'user';
                    return (
                        <Box
                            key={idx}
                            sx={{
                                display: 'flex',
                                justifyContent: isUser ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}
                        >
                            <Box
                                sx={{
                                    maxWidth: '70%',
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: isUser ? 'primary.main' : botBubbleColor,
                                    color: isUser
                                        ? 'primary.contrastText'
                                        : theme.palette.text.primary,
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                {msg.sender === 'bot' ? (
                                    <Box
                                        sx={{
                                            '& p, & li': {
                                                lineHeight: 1.4,
                                                marginBottom: 0,
                                                marginTop:0
                                            },
                                            typography: 'body2',
                                            color: theme.palette.text.primary
                                        }}
                                    >
                                        <ReactMarkdown
                                            components={markdownComponents}
                                            remarkPlugins={[remarkBreaks, remarkGfm]}
                                        >
                                            {msg.text.replace(/[\t ]*\n+[\t ]*/g, '\n')}
                                        </ReactMarkdown>
                                    </Box>
                                ) : (
                                    <Typography variant="body2">
                                        {msg.text}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* 操作按钮 */}
            <Box
                sx={{
                    p: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 1
                }}
            >
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleNewChat}
                >
                    CLEAR
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSamplePrompt}
                >
                    HINT
                </Button>
            </Box>

            {/* 输入区域 */}
            <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex'
                }}
            >
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
                <Button
                    variant="contained"
                    sx={{ ml: 1 }}
                    onClick={handleSend}
                    disabled={loading}
                >
                    {loading ? 'Waiting...' : 'Send'}
                </Button>
            </Box>
        </Box>
    );
};

export default AIPanel;
