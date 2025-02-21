import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import SideMenu from './components/SideMenu.tsx';
import AppNavbar from './components/AppNavbar.tsx';
import AppTheme from '../shared-theme/AppTheme.tsx';
import Editor from '@monaco-editor/react';
import HighlightedCard from './components/HighlightedCard.tsx';
import Grid from '@mui/material/Grid2';

export default function CodeEditorPage(props: { disableCustomTheme?: boolean }) {
  // 定义一个暗黑风格的 IDE 主题，并且配置大号代码字体
  function handleEditorWillMount(monaco: any) {
    monaco.editor.defineTheme('nice-dark-ide', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '7c7c7c', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c586c0', fontStyle: 'bold' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'delimiter', foreground: 'c4c4c4' },
        // 根据需要添加更多 token 样式规则
      ],
      colors: {
        'editor.background': '#0D1017', // 使用 VS Code 常见的深色背景
        'editor.foreground': '#ABB2BF',
        'editorLineNumber.foreground': '#636D83',
        'editorCursor.foreground': '#528BFF',
        'editor.selectionBackground': '#3E4451',
        'editor.inactiveSelectionBackground': '#3E445199',
      },
    });
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 左侧侧边栏 */}
        <SideMenu />
        {/* 主内容区域 */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 导航栏 */}
          <AppNavbar />
          {/* 响应式内容区域：根据长宽比决定是左右还是上下布局 */}
          <Box
            component="main"
            sx={{
              display: 'flex',
              flexGrow: 1,
              overflow: 'hidden',
              flexDirection: 'row', // 默认左右布局
              '@media (max-aspect-ratio: 1/1)': {
                flexDirection: 'column', // 竖屏时变为上下布局
              },
            }}
          >
            {/* 分析区（左边/上边） */}
            <Box
              sx={{
                width: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '@media (max-aspect-ratio: 1/1)': {
                  width: '100%',
                  height: '50%',
                },
              }}
            >
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <HighlightedCard />
              </Grid>
            </Box>
            {/* 编辑器区域（右边/下边） */}
            <Box
              sx={{
                width: '50%',
                height: '100%',
                p: 2,
                '@media (max-aspect-ratio: 1/1)': {
                  width: '100%',
                  height: '50%',
                },
              }}
            >
              <Editor
                height="100%"
                defaultLanguage="python"
                defaultValue="# 在此处编写 Python 代码..."
                theme="nice-dark-ide"
                beforeMount={handleEditorWillMount}
                options={{
                  automaticLayout: true,
                  fontFamily: 'Fira Code, Consolas, monospace',
                  fontSize: 16, // 代码字体调大
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}