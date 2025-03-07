import * as React from 'react';
import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Split from 'react-split';
import Editor from '@monaco-editor/react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import TextField from '@mui/material/TextField';

const pages = ['Practice', 'Home', 'Analysis', 'History'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

/**
 * 题目描述组件：顶部工具栏 + 题目正文
 */
const Description: React.FC = () => {
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 工具栏区域 */}
            <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small">Hint</Button>
                <Button variant="outlined" size="small">Solution</Button>
                <Button variant="outlined" size="small">Tips</Button>
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

/**
 * 代码编辑器组件（Demo）
 */
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
                theme="vs-light"
                options={{ automaticLayout: true, fontSize: 16 }}
                height="100%"
                width="100%"
            />
        </Box>
    );
};

/**
 * AI 聊天面板：更美观的气泡样式 + 快捷操作按钮
 */
const AIPanel: React.FC = () => {
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

    // 快捷操作示例
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
            {/* 标题 */}
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                <Typography variant="h6">AI Chat</Typography>
            </Box>
            {/* 快捷操作按钮 */}
            <Box sx={{ p: 1, borderBottom: '1px solid #eee', display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={handleClear}>Clear Chat</Button>
                <Button variant="outlined" size="small" onClick={handleSamplePrompt}>Sample Prompt</Button>
                <Button variant="outlined" size="small" onClick={handleNewChat}>New Chat</Button>
            </Box>
            {/* 聊天记录 */}
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', backgroundColor: '#fafafa' }}>
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
                                    bgcolor: isUser ? '#0084ff' : '#e4e6eb',
                                    color: isUser ? '#fff' : '#000',
                                }}
                            >
                                <Typography variant="body2">{msg.text}</Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            {/* 输入区 */}
            <Box sx={{ p: 2, display: 'flex', borderTop: '1px solid #eee' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type your message..."
                />
                <Button variant="contained" sx={{ ml: 1 }} onClick={handleSend}>
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default function App() {
    // 三栏 / 两栏布局
    const [splitSizes, setSplitSizes] = useState<number[]>([25, 50, 25]);
    const [storedThreeSizes, setStoredThreeSizes] = useState<number[]>([25, 50, 25]);
    const [aiVisible, setAiVisible] = useState(true);

    // 菜单状态
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 切换 AI 面板
    const handleToggleAIPanel = () => {
        if (aiVisible) {
            setStoredThreeSizes(splitSizes);
            const total = splitSizes[0] + splitSizes[1];
            setSplitSizes([(splitSizes[0] / total) * 100, (splitSizes[1] / total) * 100]);
            setAiVisible(false);
        } else {
            setSplitSizes(storedThreeSizes);
            setAiVisible(true);
        }
    };

    // AppBar 菜单
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* 顶部导航栏（去掉多余投影） */}
            <AppBar
                position="static"
                sx={{
                    boxShadow: 'none',
                    borderBottom: '1px solid #ccc', // 细边线替代过重阴影
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* 左侧 Logo */}
                        <DataObjectIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="#"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            CODESHIN 源神
                        </Typography>
                        {/* 移动端菜单按钮 */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{ display: { xs: 'block', md: 'none' } }}
                            >
                                {pages.map(page => (
                                    <MenuItem key={page} onClick={handleCloseNavMenu}>
                                        <Typography textAlign="center">{page}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                        {/* 桌面端菜单 */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map(page => (
                                <Button
                                    key={page}
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>
                        {/* 右侧：AI 切换按钮（机器人图标） 和 设置图标 */}
                        <Tooltip title="Toggle AI Panel">
                            <IconButton onClick={handleToggleAIPanel} sx={{ color: 'white' }}>
                                <SmartToyIcon />
                            </IconButton>
                        </Tooltip>
                        <Box sx={{ flexGrow: 0, ml: 2 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ color: 'white' }}>
                                    <SettingsIcon />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map(setting => (
                                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                        <Typography textAlign="center">{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* 主内容区域 */}
            <Box ref={containerRef} sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Split
                    sizes={aiVisible ? splitSizes : [50, 50]}
                    minSize={100}
                    gutterSize={10}
                    direction="horizontal"
                    onDragEnd={newSizes => setSplitSizes(newSizes)}
                    style={{ display: 'flex', width: '100%', height: '100%' }}
                >
                    {/* 左侧：题目区（含小工具栏） */}
                    <Box
                        style={{
                            height: '100%',
                            overflow: 'auto',
                            borderRight: '1px solid #eeeeee',
                            backgroundColor: '#fff',
                        }}
                    >
                        <Description />
                    </Box>

                    {/* 中间：代码编辑区 */}
                    <Box style={{ height: '100%', overflow: 'auto', backgroundColor: '#fefefe' }}>
                        <CodeEditor />
                    </Box>

                    {/* 右侧：AI 面板（可隐藏） */}
                    {aiVisible && (
                        <Box style={{ height: '100%', overflow: 'auto', backgroundColor: '#fff' }}>
                            <AIPanel />
                        </Box>
                    )}
                </Split>
            </Box>
        </Box>
    );
}
