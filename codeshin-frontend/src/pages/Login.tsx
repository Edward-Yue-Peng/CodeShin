// src/pages/Login.tsx
// 登录

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import './Login.css';
const apiUrl = import.meta.env.VITE_API_BASE_URL;

import { UserContext } from '../context/UserContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
    const [registerOpen, setRegisterOpen] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    // 创建背景粒子效果
    useEffect(() => {
        const particles = document.getElementById('particles');
        if (!particles) return;
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 5 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 10;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            particles.appendChild(particle);
        }
        return () => {
            while (particles.firstChild) particles.removeChild(particles.firstChild);
        };
    }, []);

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const showSnackbar = (message: string, severity: 'error' | 'success' = 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            showSnackbar('Please enter both username and password.', 'error');
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                showSnackbar(data.error || 'Login failed.', 'error');
                return;
            }
            setUser({ userId: data.userid, username });
            navigate('/home');
        } catch (err: any) {
            showSnackbar('Network error, please try again later.', 'error');
        }
    };

    const handleRegister = async () => {
        if (!regUsername || !regPassword) {
            showSnackbar('Please enter both username and password.', 'error');
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/api/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: regUsername, password: regPassword }),
            });
            const data = await response.json();
            if (response.status !== 201) {
                showSnackbar(data.error || 'Registration failed.', 'error');
            } else {
                showSnackbar('Registration successful! Please log in.', 'success');
                setRegisterOpen(false);
            }
        } catch (err: any) {
            showSnackbar('Network error, please try again later.', 'error');
        }
    };

    return (
        <div className="login-page">
            <div className="particles" id="particles"></div>
            <div className="login-container">
                <div className="logo">
                    <h1>CODESHIN</h1>
                    <span>源 神</span>
                </div>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>

                    <Box sx={{ mb: 2 }}>
                        <TextField
                            variant="outlined"
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                            required
                            InputProps={{ style: { color: 'white' } }}
                            InputLabelProps={{ style: { color: 'white' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'white' },
                                    '&:hover fieldset': { borderColor: 'white' },
                                    '&.Mui-focused fieldset': { borderColor: 'white' },
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <TextField
                            variant="outlined"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            required
                            InputProps={{ style: { color: 'white' } }}
                            InputLabelProps={{ style: { color: 'white' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'white' },
                                    '&:hover fieldset': { borderColor: 'white' },
                                    '&.Mui-focused fieldset': { borderColor: 'white' },
                                },
                            }}
                        />
                    </Box>

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
                        Log In
                    </Button>
                </Box>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button variant="text" onClick={() => setRegisterOpen(true)} sx={{ color: '#51a2ff' }}>
                        Register Now
                    </Button>
                </Box>

                <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)}>
                    <DialogTitle>Register Account</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 1 }}>
                            <TextField variant="outlined" label="Username" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} fullWidth required sx={{ mb: 2 }} />
                            <TextField variant="outlined" label="Password" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} fullWidth required />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRegisterOpen(false)}>Cancel</Button>
                        <Button onClick={handleRegister} variant="contained">Register</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default Login;
