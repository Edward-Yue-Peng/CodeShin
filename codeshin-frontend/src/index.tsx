import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Practice from './pages/Practice';
import Home from './pages/Home';
import MobileWarning from './pages/MobileWarning';
import OrientationGuard from './OrientationGuard';
import './index.css';
import Analysis from "./pages/Analysis";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { UserProvider } from './context/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <UserProvider>
            <HashRouter>
                <OrientationGuard>
                    <Routes>
                        <Route path="/mobile" element={<MobileWarning />} />
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/practice" element={<Practice />} />
                        <Route path="/analysis" element={<Analysis />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Routes>
                </OrientationGuard>
            </HashRouter>
        </UserProvider>
    </React.StrictMode>
);
