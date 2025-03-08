// src/OrientationGuard.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface OrientationGuardProps {
    children: React.ReactNode;
}

const OrientationGuard: React.FC<OrientationGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkOrientation = () => {
            if (window.innerWidth < window.innerHeight) {
                // 竖屏时，若当前不在 /mobile，则跳转到 /mobile
                if (location.pathname !== '/mobile') {
                    navigate('/mobile');
                }
            } else {
                // 横屏时，若当前在 /mobile，则跳转回默认的 Practice 页面（"/"）
                if (location.pathname === '/mobile') {
                    navigate('/');
                }
            }
        };

        // 初始检测
        checkOrientation();

        // 添加监听器
        window.addEventListener('resize', checkOrientation);
        return () => {
            window.removeEventListener('resize', checkOrientation);
        };
    }, [navigate, location]);

    return <>{children}</>;
};

export default OrientationGuard;
