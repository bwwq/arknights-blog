import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import config from './config';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import './styles/arknights-theme.css';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Monitor = lazy(() => import('./pages/Monitor'));
const Operators = lazy(() => import('./pages/Operators'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogEditor = lazy(() => import('./pages/BlogEditor'));
const Setup = lazy(() => import('./pages/Setup'));

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: 'var(--rhodes-cyan)',
    fontFamily: 'var(--font-mono)'
  }}>
    正在加载模块...
  </div>
);

const App = () => {
  const [isInitialized, setIsInitialized] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');

  useEffect(() => {
    // Check if system is initialized
    axios.get(`${config.API_URL}/api/setup/status`)
      .then(res => {
        setIsInitialized(res.data.isInitialized);
        setGithubUsername(res.data.githubUsername || '');
      })
      .catch(err => {
        console.error('Failed to check setup status:', err);
        setIsInitialized(false);
      });
  }, []);

  useEffect(() => {
    if (githubUsername) {
      // Find existing favicon or create new one
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/png';
      link.href = `https://github.com/${githubUsername}.png`;
      console.log('Favicon updated to:', link.href);
    }
  }, [githubUsername]);

  const handleSetupComplete = (username) => {
    setGithubUsername(username);
    setIsInitialized(true);
  };

  // Show loading while checking initialization status
  if (isInitialized === null) {
    return <LoadingFallback />;
  }

  // Show setup wizard if not initialized
  if (!isInitialized) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Setup onComplete={handleSetupComplete} />
      </Suspense>
    );
  }

  // Show main app if initialized
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            {/* Top Status Bar */}
            <header className="app-header">
              <div className="text-mono text-gray">终端 // 系统就绪</div>
              <div className="text-mono text-cyan">用户: {githubUsername || '博士'}</div>
            </header>

            <div className="content-scroll-area">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/monitor" element={<Monitor />} />
                  <Route path="/operators" element={<Operators />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/new" element={<BlogEditor />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/blog/:id/edit" element={<BlogEditor />} />
                </Routes>
              </Suspense>
            </div>
          </main>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
