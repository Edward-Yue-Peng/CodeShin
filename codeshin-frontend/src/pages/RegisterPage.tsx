import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import './LoginPage.css';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // 创建背景粒子效果，与 LoginPage 保持一致
    useEffect(() => {
        const particles = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 5 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            const animationDuration = Math.random() * 20 + 10;
            const animationDelay = Math.random() * 10;
            particle.style.animationDuration = `${animationDuration}s`;
            particle.style.animationDelay = `${animationDelay}s`;
            // @ts-ignore
            particles.appendChild(particle);
        }
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

        try {
            const response = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const text = await response.text();
            console.log('Raw response text:', text);
            const data = JSON.parse(text);

            if (response.status !== 201) {
                alert(data.error || '注册失败，请检查输入信息');
            } else {
                alert('注册成功，请前往登录！');
                navigate('/login');
            }
        } catch (err) {
            alert('网络错误，请稍后再试\n' + err);
        }
    };

    return (
        <div className="login-page">
            {/* 动态背景粒子 */}
            <div className="particles" id="particles"></div>

            <div className="login-container">
                <div className="logo">
                    <h1>注册账号</h1>
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
                        注 册
                    </Button>
                </form>

                <div className="footer">
                    <p>
                        已有账号? <Link to="/login">立即登录</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
