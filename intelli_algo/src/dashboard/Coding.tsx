import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import SideMenu from './components/SideMenu.tsx';
import AppNavbar from './components/AppNavbar.tsx';
import AppTheme from '../shared-theme/AppTheme.tsx';
import Editor from '@monaco-editor/react';

export default function CodeEditorPage(props: { disableCustomTheme?: boolean }) {
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
          {/* 分左右的内容区域 */}
          <Box component="main" sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            {/* 左边区域（暂时为空，可自行扩展） */}
            <Box
              sx={{
                width: '50%',
                // 如果需要分割线可以取消注释
                // borderRight: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* 可在此处添加预览、文件树或其他功能 */}
            </Box>

            {/* 右边区域：Monaco Editor 代码编辑器 */}
            <Box
              sx={{
                width: '50%',
                height: '100%',
                p: 2,
              }}
            >
              <Editor
                height="100%"
                defaultLanguage="python"
                defaultValue="# 在此处编写 Python 代码..."
                theme="vs-dark"
                options={{
                  automaticLayout: true,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}