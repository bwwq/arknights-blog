import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import './ThemeSelector.css';

const ThemeSelector = ({ onOpenCustomizer }) => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        activeTheme,
        serverTheme,
        customSchemes,
        switchTheme,
        saveAsGlobalDefault,
        getThemeDisplayName,
        THEME_NAMES,
        THEME_COLORS
    } = useTheme();
    const { isAuthenticated } = useAuth();
    const toast = useToast();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleThemeSelect = (themeId) => {
        switchTheme(themeId);
        // Don't close menu immediately to allow admin to save as default
        if (!isAuthenticated) {
            setIsOpen(false);
        }
    };

    const handleSaveDefault = async (e) => {
        e.stopPropagation();
        try {
            await saveAsGlobalDefault();
            toast.success('已设置为全局默认主题');
            setIsOpen(false);
        } catch (error) {
            toast.error('设置失败，请重试');
        }
    };

    const handleCreateCustom = () => {
        setIsOpen(false);
        if (onOpenCustomizer) {
            onOpenCustomizer();
        }
    };

    // Get theme preview color (accent-primary)
    const getThemeColor = (themeId) => {
        return THEME_COLORS[themeId] || THEME_COLORS['arknights'];
    };

    return (
        <div className="theme-selector">
            <button
                className="theme-toggle"
                onClick={toggleMenu}
                title="切换主题"
            >
                <span className="icon">🎨</span>
                <span className="theme-name">{getThemeDisplayName(activeTheme)}</span>
            </button>

            {isOpen && (
                <>
                    <div className="theme-overlay" onClick={() => setIsOpen(false)}></div>
                    <div className="theme-menu">
                        <div className="theme-section">
                            <div className="section-label">预设主题</div>
                            {Object.entries(THEME_NAMES).map(([id, name]) => (
                                <div
                                    key={id}
                                    className={`theme-item ${activeTheme === id ? 'active' : ''}`}
                                    onClick={() => handleThemeSelect(id)}
                                >
                                    <div
                                        className="theme-preview"
                                        style={{ backgroundColor: getThemeColor(id) }}
                                    ></div>
                                    <span className="theme-label">{name}</span>
                                    {activeTheme === id && <span className="check-mark">✓</span>}
                                    {serverTheme === id && <span className="default-badge" title="全局默认">默认</span>}
                                </div>
                            ))}
                        </div>

                        {Object.keys(customSchemes).length > 0 && (
                            <>
                                <div className="theme-divider"></div>
                                <div className="theme-section">
                                    <div className="section-label">自定义方案</div>
                                    {Object.entries(customSchemes).map(([name, colors]) => (
                                        <div
                                            key={name}
                                            className={`theme-item ${activeTheme === `custom:${name}` ? 'active' : ''}`}
                                            onClick={() => handleThemeSelect(`custom:${name}`)}
                                        >
                                            <div
                                                className="theme-preview"
                                                style={{ backgroundColor: colors['accent-primary'] || '#333' }}
                                            ></div>
                                            <span className="theme-label">{name}</span>
                                            {activeTheme === `custom:${name}` && <span className="check-mark">✓</span>}
                                            {serverTheme === `custom:${name}` && <span className="default-badge" title="全局默认">默认</span>}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {isAuthenticated && activeTheme !== serverTheme && (
                            <>
                                <div className="theme-divider"></div>
                                <button className="theme-action-btn" onClick={handleSaveDefault}>
                                    设为全局默认
                                </button>
                            </>
                        )}

                        {isAuthenticated && (
                            <>
                                <div className="theme-divider"></div>
                                <button className="theme-create-btn" onClick={handleCreateCustom}>
                                    + 新建自定义方案
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ThemeSelector;
