import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import './LoginPage.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // 创建背景粒子效果
    useEffect(() => {
        const particles = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // 随机大小和位置
            const size = Math.random() * 5 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;

            // 随机动画延迟和持续时间
            const animationDuration = Math.random() * 20 + 10;
            const animationDelay = Math.random() * 10;
            particle.style.animationDuration = `${animationDuration}s`;
            particle.style.animationDelay = `${animationDelay}s`;

            // @ts-ignore
            particles.appendChild(particle);
        }

        // 清理函数
        return () => {
            // @ts-ignore
            while (particles.firstChild) {
                // @ts-ignore
                particles.removeChild(particles.firstChild);
            }
        };
    }, []);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!username || !password) {
            alert('请输入用户名和密码！');
            return;
        }

        const response = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        response.status;
        const text = await response.text(); // 先当字符串读出来看看
        console.log('Raw response text:', text);
        try {
            const data = JSON.parse(text);
            if (response.status !== 200) {
                alert(data.error);
            }
            else {
                    navigate('/home');
                }
        } catch (err) {
            alert('网络错误，请稍后再试\n' + err + '\n' + text); // 展示报错和原始内容
        }
    };

    return (
        <div className="login-page">
            {/* 动态背景粒子 */}
            <div className="particles" id="particles"></div>

            <div className="login-container">
                <div className="logo">
                    <h1>CODESHIN</h1>
                    <span>源 神</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <TextField
                            variant="outlined"
                            label="用户名"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                            required
                            InputProps={{
                                style: { color: 'white' },
                            }}
                            InputLabelProps={{
                                style: { color: 'white' },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <TextField
                            variant="outlined"
                            label="密码"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            required
                            InputProps={{
                                style: { color: 'white' },
                            }}
                            InputLabelProps={{
                                style: { color: 'white' },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                            }}
                        />
                    </div>

                    <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        className="login-btn"
                        sx={{
                            color: 'white',
                            backgroundColor: '#51a2ff',
                            '&:hover': { backgroundColor: '#4180d0' },
                            padding: '10px',
                            fontWeight: 'bold',
                        }}
                    >
                        登 录
                    </Button>
                </form>

                <div className="footer">
                    <p>
                        还没有账号? <Link to="/register">立即注册</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
