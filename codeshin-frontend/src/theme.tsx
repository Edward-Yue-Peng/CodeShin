// src/theme.ts
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

/**
 * 根据传入的 mode 返回自定义主题
 * @param mode 'light' | 'dark' | 'system'
 *   当 mode 为 system 时，在 Practice 中会根据系统偏好决定实际使用 light 或 dark
 */
export const getTheme = (mode: 'light' | 'dark' | 'system') => {
  // 默认：若是 system 模式，则由 Practice 决定，这里可以先设置为 light 作为默认
  const resolvedMode: 'light' | 'dark' = mode === 'system' ? 'light' : mode;
  return createTheme({
    cssVariables: true,
    palette: {
      mode: resolvedMode,
      ...(resolvedMode === 'light'
          ? {
            primary: { main: '#556cd6' },
            secondary: { main: '#19857b' },
            error: { main: red.A400 },
            background: {
              default: '#f5f5f5',
              paper: '#fff',
            },
          }
          : {
            primary: { main: '#90caf9' },
            secondary: { main: '#f48fb1' },
            error: { main: red.A400 },
            background: {
              default: '#121212',
              paper: '#1d1d1d',
            },
          }),
    },
  });
};

// 默认导出使用亮模式的主题
const theme = getTheme('light');
export default theme;
