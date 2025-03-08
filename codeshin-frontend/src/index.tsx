// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Practice from './pages/Practice';
import Home from './pages/Home';
import MobileWarning from './pages/MobileWarning';
import OrientationGuard from './OrientationGuard';
import './index.css';
import Analysis from "./pages/Analysis";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <OrientationGuard>
                <Routes>
                    <Route path="/mobile" element={<MobileWarning />} />
                    <Route path="/" element={<Practice />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/practice" element={<Practice />} />
                    <Route path="/analysis" element={<Analysis />} />
                </Routes>
            </OrientationGuard>
        </BrowserRouter>
    </React.StrictMode>
);
