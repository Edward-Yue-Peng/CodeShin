// src/components/NavBar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

interface NavBarProps {
    onToggleAIPanel: () => void;
    onOpenUserMenu: (event: React.MouseEvent<HTMLElement>) => void;
    pages: string[];
    currentMode: 'system' | 'light' | 'dark';
    onChangeColorMode: (mode: 'system' | 'light' | 'dark') => void;
}

const NavBar: React.FC<NavBarProps> = ({
                                           onToggleAIPanel,
                                           onOpenUserMenu,
                                           pages,
                                           currentMode,
                                           onChangeColorMode,
                                       }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    // 用于主题模式菜单
    const [anchorElTheme, setAnchorElTheme] = React.useState<null | HTMLElement>(null);

    const handleOpenThemeMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElTheme(event.currentTarget);
    };
    const handleCloseThemeMenu = () => {
        setAnchorElTheme(null);
    };

    // 根据当前模式选择图标
    const renderThemeIcon = () => {
        if (currentMode === 'system') return <SettingsBrightnessIcon />;
        if (currentMode === 'light') return <Brightness7Icon />;
        return <Brightness4Icon />;
    };

    return (
        <AppBar
            position="static"
            sx={{
                boxShadow: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* 左侧 Logo */}
                    <IconButton color="inherit" sx={{ mr: 2 }}>
                        <DataObjectIcon fontSize="large" />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                        }}
                    >
                        CODESHIN 源神
                    </Typography>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                        {pages.map((page) => {
                            const path = page.toLowerCase() === 'home' ? '/' : `/${page.toLowerCase()}`;
                            const location = useLocation();  // 获取当前路径

                            return (
                                <Button
                                    key={page}
                                    color="inherit"
                                    onClick={() => {
                                        if (location.pathname !== path) {  // 仅在不同路径时导航
                                            navigate(path);
                                        }
                                    }}
                                >
                                    {page}
                                </Button>
                            );
                        })}
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* 主题模式切换按钮 */}
                    <Tooltip title="Change Theme Mode">
                        <IconButton onClick={handleOpenThemeMenu} sx={{ ml: 1 }} color="inherit">
                            {renderThemeIcon()}
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorElTheme}
                        open={Boolean(anchorElTheme)}
                        onClose={handleCloseThemeMenu}
                    >
                        <MenuItem
                            selected={currentMode === 'system'}
                            onClick={() => {
                                onChangeColorMode('system');
                                handleCloseThemeMenu();
                            }}
                        >
                            System Default
                        </MenuItem>
                        <MenuItem
                            selected={currentMode === 'light'}
                            onClick={() => {
                                onChangeColorMode('light');
                                handleCloseThemeMenu();
                            }}
                        >
                            Light Mode
                        </MenuItem>
                        <MenuItem
                            selected={currentMode === 'dark'}
                            onClick={() => {
                                onChangeColorMode('dark');
                                handleCloseThemeMenu();
                            }}
                        >
                            Dark Mode
                        </MenuItem>
                    </Menu>

                    {/* AI 面板切换 */}
                    <Tooltip title="Toggle AI Panel">
                        <IconButton onClick={onToggleAIPanel} sx={{ ml: 1 }} color="inherit">
                            <SmartToyIcon />
                        </IconButton>
                    </Tooltip>

                    {/* 设置按钮 */}
                    <Tooltip title="Open Settings">
                        <IconButton onClick={onOpenUserMenu} sx={{ ml: 1 }} color="inherit">
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default NavBar;
