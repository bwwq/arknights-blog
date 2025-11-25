import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button className={`mobile-toggle ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            {/* Overlay for mobile */}
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={closeMenu}></div>

            <nav className={`rhodes-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-box">PRTS</div>
                </div>

                <div className="sidebar-menu">
                    <NavLink to="/" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        <span className="icon">▤</span>
                        <span className="label">主页</span>
                    </NavLink>

                    <NavLink to="/monitor" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        <span className="icon">⚡</span>
                        <span className="label">监控</span>
                    </NavLink>

                    <NavLink to="/operators" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        <span className="icon">◈</span>
                        <span className="label">干员</span>
                    </NavLink>

                    <NavLink to="/blog" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        <span className="icon">✎</span>
                        <span className="label">博客</span>
                    </NavLink>
                </div>

                <div className="sidebar-footer">
                    <div className="status-dot online"></div>
                    <span className="version">v2.0.0</span>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
