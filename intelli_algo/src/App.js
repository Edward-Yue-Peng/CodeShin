import React from 'react';
import { Box, Drawer, Grid, TextField } from '@mui/material';

const drawerWidth = 240;

export default function MyPage() {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* 左侧边栏 */}
      <Drawer
        variant="persistent"
        anchor="left"
        open
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>左侧边栏内容</Box>
      </Drawer>

      {/* 主内容区域，左右各留出边栏宽度 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${drawerWidth}px`,
          mr: `${drawerWidth}px`,
        }}
      >
        <Grid container spacing={2}>
          {/* 主内容左半部分：暂时为空 */}
          <Grid item xs={6}>
            <Box sx={{ height: '100%', border: '1px dashed grey', p: 2 }}>
              左侧空白区域
            </Box>
          </Grid>
          {/* 主内容右半部分：Python代码编辑区域 */}
          <Grid item xs={6}>
            <TextField
              label="Python代码"
              placeholder="在此输入Python代码..."
              multiline
              rows={15}
              variant="outlined"
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      {/* 右侧边栏 */}
      <Drawer
        variant="persistent"
        anchor="right"
        open
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>右侧边栏内容</Box>
      </Drawer>
    </Box>
  );
}