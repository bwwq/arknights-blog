import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import './ArknightsLoader.css';

const ArknightsLoader = ({ onComplete }) => {
    const networkCanvasRef = useRef(null);
    const containerRef = useRef(null);
    const uiLayerRef = useRef(null);
    const percentRef = useRef(null);
    const overlayRef = useRef(null);
    const requestRef = useRef(null);
    const intervalRef = useRef(null);
    const revealIntervalRef = useRef(null);

    useEffect(() => {
        // --- Initialization ---
        // Lock body overflow to prevent scrolling and layout shifts
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const networkCanvas = networkCanvasRef.current;
        const netCtx = networkCanvas.getContext('2d');
        const container = containerRef.current;
        const overlay = overlayRef.current;
        const uiLayer = uiLayerRef.current;
        const percentEl = percentRef.current;

        // Use client dimensions to avoid scrollbar issues
        const width = window.innerWidth;
        const height = window.innerHeight;

        networkCanvas.width = width;
        networkCanvas.height = height;

        // --- Network Logic ---
        class NetworkNode {
            constructor(index, total) {
                const angle = (index / total) * Math.PI * 2;
                // Fixed radius logic to ensure consistent shape (circle)
                const radius = Math.min(width, height) * 0.35;
                this.targetX = width / 2 + Math.cos(angle) * radius;
                this.targetY = height / 2 + Math.sin(angle) * radius;
                this.x = width / 2;
                this.y = height / 2;
                this.progress = 0;
                this.active = false;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }
            update(speed) {
                if (this.active && this.progress < 1) {
                    this.progress += speed;
                    if (this.progress > 1) this.progress = 1;
                    this.x = this.x + (this.targetX - this.x) * this.progress;
                    this.y = this.y + (this.targetY - this.y) * this.progress;
                }
                this.pulsePhase += 0.03;
            }
        }

        class DataPacket {
            constructor(x1, y1, x2, y2) {
                this.x1 = x1; this.y1 = y1;
                this.x2 = x2; this.y2 = y2;
                this.progress = 0;
                this.speed = 0.01 + Math.random() * 0.02;
            }
            update() {
                this.progress += this.speed;
                if (this.progress > 1) this.progress = 0;
            }
            draw(ctx) {
                const x = this.x1 + (this.x2 - this.x1) * this.progress;
                const y = this.y1 + (this.y2 - this.y1) * this.progress;
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(35, 173, 229, 1)';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        const nodeCount = 12; // Reduced count slightly for cleaner look, matching HTML v1
        const nodes = Array.from({ length: nodeCount }, (_, i) => new NetworkNode(i, nodeCount));
        const dataPackets = [];
        let activeNodeIndex = 0;
        let networkProgress = 0;
        let scanLineY = 0;
        let connectionCount = 0;

        const drawNetwork = () => {
            netCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);

            // Draw scanning line
            scanLineY = (scanLineY + 2) % networkCanvas.height;
            const gradient = netCtx.createLinearGradient(0, scanLineY - 50, 0, scanLineY + 50);
            gradient.addColorStop(0, 'rgba(35, 173, 229, 0)');
            gradient.addColorStop(0.5, 'rgba(35, 173, 229, 0.15)');
            gradient.addColorStop(1, 'rgba(35, 173, 229, 0)');
            netCtx.fillStyle = gradient;
            netCtx.fillRect(0, scanLineY - 50, networkCanvas.width, 100);

            connectionCount = 0;
            for (let i = 0; i < nodes.length; i++) {
                if (!nodes[i].active) continue;
                for (let j = i + 1; j < nodes.length; j++) {
                    if (!nodes[j].active) continue;
                    const dist = Math.sqrt((nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2);
                    if (dist > 300) continue;

                    connectionCount++;
                    const opacity = Math.min(nodes[i].progress, nodes[j].progress) * (1 - dist / 600) * 0.6;
                    const lineGradient = netCtx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    lineGradient.addColorStop(0, `rgba(35, 173, 229, ${opacity})`);
                    lineGradient.addColorStop(0.5, `rgba(35, 173, 229, ${opacity * 1.5})`);
                    lineGradient.addColorStop(1, `rgba(35, 173, 229, ${opacity})`);
                    netCtx.strokeStyle = lineGradient;
                    netCtx.lineWidth = 1.5;
                    netCtx.shadowBlur = 6;
                    netCtx.shadowColor = 'rgba(35, 173, 229, 0.5)';
                    netCtx.beginPath();
                    netCtx.moveTo(nodes[i].x, nodes[i].y);
                    netCtx.lineTo(nodes[j].x, nodes[j].y);
                    netCtx.stroke();
                    netCtx.shadowBlur = 0;

                    if (Math.random() < 0.005 && dataPackets.length < 30) {
                        dataPackets.push(new DataPacket(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y));
                    }
                }
            }

            dataPackets.forEach((packet, index) => {
                packet.update();
                packet.draw(netCtx);
                if (packet.progress >= 1 && Math.random() < 0.1) {
                    dataPackets.splice(index, 1);
                }
            });

            nodes.forEach(node => {
                if (!node.active) return;
                const pulse = Math.sin(node.pulsePhase) * 0.3 + 0.7;
                const size = (4 + node.progress * 3) * pulse;

                netCtx.shadowBlur = 25 * pulse;
                netCtx.shadowColor = 'rgba(35, 173, 229, 0.8)';
                netCtx.fillStyle = `rgba(35, 173, 229, ${node.progress * 0.8})`;
                netCtx.beginPath();
                netCtx.arc(node.x, node.y, size + 5, 0, Math.PI * 2);
                netCtx.fill();

                netCtx.fillStyle = `rgba(255, 255, 255, ${node.progress})`;
                netCtx.beginPath();
                netCtx.arc(node.x, node.y, size, 0, Math.PI * 2);
                netCtx.fill();

                netCtx.strokeStyle = `rgba(35, 173, 229, ${node.progress * 0.6})`;
                netCtx.lineWidth = 2;
                netCtx.beginPath();
                netCtx.arc(node.x, node.y, size + 6, 0, Math.PI * 2);
                netCtx.stroke();
                netCtx.shadowBlur = 0;
            });

            drawCornerDecorations();

            netCtx.font = '12px "Courier New"';
            netCtx.fillStyle = 'rgba(35, 173, 229, 0.8)';
            netCtx.fillText(`CONNECTIONS: ${connectionCount}`, 20, networkCanvas.height - 20);
            netCtx.fillText(`NODES: ${activeNodeIndex}/${nodeCount}`, 20, networkCanvas.height - 40);
        };

        const drawCornerDecorations = () => {
            const cornerSize = 30;
            const offset = 20;
            netCtx.strokeStyle = 'rgba(35, 173, 229, 0.5)';
            netCtx.lineWidth = 2;

            netCtx.beginPath(); netCtx.moveTo(offset + cornerSize, offset); netCtx.lineTo(offset, offset); netCtx.lineTo(offset, offset + cornerSize); netCtx.stroke();
            netCtx.beginPath(); netCtx.moveTo(networkCanvas.width - offset - cornerSize, offset); netCtx.lineTo(networkCanvas.width - offset, offset); netCtx.lineTo(networkCanvas.width - offset, offset + cornerSize); netCtx.stroke();
            netCtx.beginPath(); netCtx.moveTo(offset, networkCanvas.height - offset - cornerSize); netCtx.lineTo(offset, networkCanvas.height - offset); netCtx.lineTo(offset + cornerSize, networkCanvas.height - offset); netCtx.stroke();
            netCtx.beginPath(); netCtx.moveTo(networkCanvas.width - offset - cornerSize, networkCanvas.height - offset); netCtx.lineTo(networkCanvas.width - offset, networkCanvas.height - offset); netCtx.lineTo(networkCanvas.width - offset, networkCanvas.height - offset - cornerSize); netCtx.stroke();
        };

        // --- Grid Tiles Logic ---
        const cols = 12;
        const rows = 9;
        const totalTiles = cols * rows;
        const tiles = [];
        const tilePositions = [];

        overlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        overlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        const tileWidth = width / cols;
        const tileHeight = height / rows;

        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'grid-tile';
            overlay.appendChild(tile);
            tiles.push(tile);
            const col = i % cols;
            const row = Math.floor(i / cols);
            tilePositions.push({ x: col * tileWidth + tileWidth / 2, y: row * tileHeight + tileHeight / 2 });
        }

        const updateTileReveal = () => {
            tiles.forEach((tile, index) => {
                const pos = tilePositions[index];
                let minDistance = Infinity;
                nodes.forEach((node, i) => {
                    if (!node.active) return;
                    const dx = pos.x - node.x;
                    const dy = pos.y - node.y;
                    minDistance = Math.min(minDistance, Math.sqrt(dx * dx + dy * dy));
                    for (let j = i + 1; j < nodes.length; j++) {
                        if (!nodes[j].active || Math.min(node.progress, nodes[j].progress) < 0.5) continue;
                        const dist = Math.sqrt((node.x - nodes[j].x) ** 2 + (node.y - nodes[j].y) ** 2);
                        if (dist > 300) continue;
                        const A = pos.x - node.x;
                        const B = pos.y - node.y;
                        const C = nodes[j].x - node.x;
                        const D = nodes[j].y - node.y;
                        const dot = A * C + B * D;
                        const lenSq = C * C + D * D;
                        let param = lenSq !== 0 ? dot / lenSq : -1;
                        let xx = param < 0 ? node.x : param > 1 ? nodes[j].x : node.x + param * C;
                        let yy = param < 0 ? node.y : param > 1 ? nodes[j].y : node.y + param * D;
                        minDistance = Math.min(minDistance, Math.sqrt((pos.x - xx) ** 2 + (pos.y - yy) ** 2));
                    }
                });
                // Increased reveal distance to 180 to ensure better coverage
                if (minDistance < 180 && !tile.classList.contains('hidden')) tile.classList.add('hidden');
            });
        };
        revealIntervalRef.current = setInterval(updateTileReveal, 50);

        // --- Three.js Logic ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 4;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);
        const outerMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.15 }));
        group.add(outerMesh);
        const innerMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), new THREE.MeshBasicMaterial({ color: 0x23ade5, wireframe: true, transparent: true, opacity: 0.4 }));
        group.add(innerMesh);
        const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }));
        coreMesh.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.OctahedronGeometry(0.6, 0)), new THREE.LineBasicMaterial({ color: 0x23ade5, transparent: true, opacity: 0.8 })));
        group.add(coreMesh);

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0; bloomPass.strength = 1.2; bloomPass.radius = 0.5;
        composer.addPass(bloomPass);

        let time = 0;
        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            time += 0.01;
            outerMesh.rotation.y += 0.002; outerMesh.rotation.x -= 0.001;
            innerMesh.rotation.y -= 0.005; innerMesh.rotation.z += 0.002;
            coreMesh.rotation.x += 0.01; coreMesh.rotation.y += 0.01;
            group.position.y = Math.sin(time * 0.5) * 0.1;
            composer.render();

            // Network Animation
            if (activeNodeIndex < nodes.length && networkProgress > activeNodeIndex * 5) {
                nodes[activeNodeIndex].active = true;
                activeNodeIndex++;
            }
            nodes.forEach(node => node.update(0.05));
            drawNetwork();
        };
        animate();

        // --- Progress Logic ---
        let progress = 0;
        let isComplete = false;

        const completeLoading = () => {
            if (isComplete) return;
            isComplete = true;
            progress = 100;
            if (percentEl) percentEl.innerText = '100%';
            tiles.forEach(t => t.classList.add('hidden'));

            const tl = setInterval(() => {
                group.scale.multiplyScalar(1.1);
                group.position.z -= 0.5;
                if (uiLayer) {
                    uiLayer.style.opacity = 0;
                    uiLayer.style.transition = 'opacity 0.5s';
                }
                if (group.position.z < -10) {
                    clearInterval(tl);
                    if (onComplete) onComplete();
                }
            }, 16);
        };

        const updateProgress = () => {
            if (progress < 100 && !isComplete) {
                let inc = Math.random() * 2 + 1;
                if (progress > 80) inc = 0.8;
                progress += inc;
                if (progress > 100) progress = 100;
                networkProgress = progress;
                if (percentEl) percentEl.innerText = Math.floor(progress).toString().padStart(2, '0') + '%';

                if (progress >= 100) {
                    completeLoading();
                } else {
                    intervalRef.current = setTimeout(updateProgress, Math.random() * 40 + 20);
                }
            }
        };
        intervalRef.current = setTimeout(updateProgress, 300);

        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            composer.setSize(w, h);
            networkCanvas.width = w;
            networkCanvas.height = h;
        };
        window.addEventListener('resize', handleResize);

        const handleClick = () => {
            if (!isComplete) completeLoading();
        };
        document.body.addEventListener('click', handleClick);

        // --- Cleanup ---
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('resize', handleResize);
            document.body.removeEventListener('click', handleClick);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (intervalRef.current) clearTimeout(intervalRef.current);
            if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
            // Clean up tiles
            while (overlay.firstChild) {
                overlay.removeChild(overlay.firstChild);
            }
        };
    }, [onComplete]);

    return (
        <div className="arknights-loader-container">
            <canvas id="network-canvas" ref={networkCanvasRef}></canvas>
            <div id="loader-overlay" ref={overlayRef}></div>
            <div id="canvas-container" ref={containerRef}></div>
            <div id="ui-layer" ref={uiLayerRef}>
                <div className="loading-label">System Loading</div>
                <div className="loading-text" ref={percentRef}>00%</div>
            </div>
        </div>
    );
};

export default ArknightsLoader;
