import React from 'react';
import './ArknightsLoader.css';

const ArknightsLoader = () => {
    return (
        <div className="ak-loader-container">
            <div className="ak-loader-logo">
                <div className="ak-rhombus"></div>
                <div className="ak-rhombus-inner"></div>
            </div>

            <div className="ak-loader-text">
                System Initializing...
            </div>

            <div className="ak-loader-bar-bg">
                <div className="ak-loader-bar-fill"></div>
            </div>

            <div className="ak-loader-deco">
                <div>RHODES ISLAND</div>
                <div>NEURAL NETWORK</div>
                <div>v1.0.0</div>
            </div>
        </div>
    );
};

export default ArknightsLoader;
