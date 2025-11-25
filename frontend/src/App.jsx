import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
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

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: 'var(--rhodes-cyan)',
    fontFamily: 'var(--font-mono)'
  }}>
    正在加载模块...
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            {/* Top Status Bar */}
            <header className="app-header">
              <div className="text-mono text-gray">终端 // 系统就绪</div>
              <div className="text-mono text-cyan">用户: 博士</div>
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
