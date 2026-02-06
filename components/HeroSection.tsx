'use client';

import { useEffect } from 'react';
import '@google/model-viewer';

declare global {
    interface Window {
        gsap: any;
        LeaderLine: any;
        Draggable: any;
    }
}

export default function HeroSection() {
    useEffect(() => {
        // Wait for libraries to load
        const initHero = () => {
            if (typeof window === 'undefined' || !window.gsap || !window.LeaderLine || !window.Draggable) {
                return;
            }

            const container = document.querySelector('.hero-draggbles-comp');
            if (!container) return;

            const elements = Array.from(container.children) as HTMLElement[];
            let lines: any[] = [];
            let isMobile = window.innerWidth <= 768;

            function clearLines() {
                lines.forEach(line => line.remove());
                lines = [];
            }

            function createConnections() {
                clearLines();

                document.querySelectorAll('.node-connect').forEach(source => {
                    const sourceID = source.id;
                    if (!sourceID) return;

                    const targetAttr = isMobile ? 'node-connect-target-m' : 'node-connect-target';
                    const rawTargets = source.getAttribute(targetAttr);

                    if (!rawTargets || rawTargets.trim() === '') return;

                    rawTargets.split(',').forEach(targetID => {
                        const target = document.getElementById(targetID.trim());
                        if (!target) return;

                        const startAnchor = source.querySelector('.line-anchor.start');
                        const endAnchor = target.querySelector('.line-anchor.end');
                        if (!startAnchor || !endAnchor) {
                            console.log("No anchors found for:", sourceID, "→", targetID.trim());
                            return;
                        }

                        const line = new window.LeaderLine(startAnchor, endAnchor, {
                            color: '#DEDEDE',
                            size: 1.4,
                            path: 'fluid',
                            startPlug: 'disc',
                            endPlug: 'disc',
                            startPlugColor: '#DEDEDE',
                            startPlugSize: 3.5,
                            startPlugOutline: true,
                            startPlugOutlineColor: '#FFFFFF',
                            endPlugColor: '#DEDEDE',
                            endPlugSize: 3.5,
                            endPlugOutline: true,
                            endPlugOutlineColor: '#FFFFFF'
                        });

                        lines.push(line);
                    });
                });
            }

            function setupDraggables() {
                if (!isMobile) {
                    elements.forEach(el => {
                        window.gsap.set(el, {
                            x: 0,
                            y: 0
                        });

                        const isHandleOnly =
                            el.classList.contains("hr-card-3d") &&
                            el.classList.contains("node-connect");

                        window.Draggable.create(el, {
                            type: 'x,y',
                            bounds: '.grid-container.is-hero',
                            handle: isHandleOnly ? '.drag-handle' : null,
                            onPress() {
                                el.style.cursor = 'grabbing';
                            },
                            onRelease() {
                                el.style.cursor = isHandleOnly ? 'default' : 'grab';
                            },
                            onDrag() {
                                lines.forEach(line => line.position());
                            }
                        });

                        el.style.cursor = isHandleOnly ? 'default' : 'grab';
                    });
                } else {
                    elements.forEach(el => {
                        el.style.cursor = 'default';
                    });
                }
            }

            function handleResize() {
                const nowMobile = window.innerWidth <= 768;
                if (nowMobile !== isMobile) {
                    isMobile = nowMobile;
                    createConnections();
                    setupDraggables();
                }

                lines.forEach(line => line.position());
            }

            // Initial setup
            createConnections();
            setupDraggables();

            // Align lines after layout
            setTimeout(() => {
                lines.forEach(line => line.position());
            }, 100);

            // Keep aligned on scroll and resize
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', () => lines.forEach(line => line.position()));
        };

        // Try to init after a delay for libraries to load
        setTimeout(initHero, 500);
    }, []);

    return (
        <section className="section-hero">
            <div className="grid-container is-hero is-banner-top">
                <div className="div-block"></div>
                <div id="w-node-_54cd4306-560e-2f33-f07c-9009e4c604b4-78a6999f" className="h1-wrapper">
                    <h1 data-w-id="9b99b1b2-6e89-692f-375b-2be0de8642af" style={{ opacity: 0 }} className="heading_h1-hero">Weavy</h1>
                </div>
                <div id="w-node-_5134b68b-08f8-d177-ea63-19167ba1aa94-78a6999f" className="vertical-wrapp">
                    <div className="h1-wrapper extra-bot-pad">
                        <h1 data-w-id="1e764d91-4a52-c6a7-7d2d-9fbb5beba55d" style={{ opacity: 0 }} className="heading_h1-hero">Artistic Intelligence</h1>
                    </div>
                    <div id="w-node-_56bcb99c-0f2a-fed0-938f-1e64de8465f1-78a6999f" className="paragraph-wrapper p-max-width-23-875">
                        <p data-w-id="b036c2bb-55c3-9729-5508-14352d4569e1" style={{ opacity: 0 }} className="text-size-large">Turn your creative vision into scalable workflows. Access all AI models and professional editing tools in one node based platform.</p>
                    </div>
                </div>
                <div id="w-node-ad200bf5-388c-5543-8832-565bb87fbb2f-78a6999f" className="hero-draggbles-comp">
                    <div id="node1" node-connect-target="node3" node-connect-target-m="node3" className="hr-card-3d node-connect w-node-d74cab7c-d307-4f7d-afc1-55ae76f00d3d-78a6999f">
                        <div className="drag-handle"></div>
                        <div data-line-path="fluid" className="line-anchor start n1"></div>
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd65ba87c69df161752e5_3d_card.avif" loading="lazy" id="3d-model-cover" alt="" className="hr_img-rodin" />
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68349ea45685e2905f5c21e6_3D_RODIN_hero_mobile.avif" loading="lazy" id="3d-model-cover" alt="" className="hr_img-rodin-mobile" />
                        <div className="_3d-model-holder">
                            <div className="_3d-model w-embed">
                                <model-viewer
                                    src="https://cdn.jsdelivr.net/gh/kshach/nbd/3D%20Model%20First%20Fold.glb"
                                    camera-controls
                                    auto-rotate
                                    disable-zoom
                                    disable-pan
                                    disable-tap
                                    field-of-view="37.5deg"
                                    exposure="0.7"
                                    auto-rotate-delay="0"
                                    rotation-per-second="-16deg"
                                    interaction-prompt="none"
                                    shadow-intensity="1"
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <div className="progress-bar hide" slot="progress-bar"></div>
                                </model-viewer>
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                  .hide {
                    display: none;
                  }
                `}} />
                                <div className="line-anchor start"></div>
                            </div>
                        </div>
                        <div className="line-anchor end"></div>
                    </div>
                    <div id="node2" node-connect-target="node3" node-connect-target-m="node3" className="hr-card-color-reference node-connect w-node-_52114269-2ff0-e113-4d3f-3ab9ae07e166-78a6999f">
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd77722078ff43fe428f3_hcard-color%20reference.avif" loading="lazy" alt="" className="hr_img-c-difference" />
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68349defe03a701656079aac_Color-diff_hero_mobile.avif" loading="lazy" alt="" className="hr_img-c-difference-mobile" />
                        <div data-line-path="magnet" className="line-anchor start n2"></div>
                    </div>
                    <div id="node3" node-connect-target="node4, node5" node-connect-target-m="node6" className="hr-card-stable-diffusion node-connect w-node-_92cb0ff1-51e7-fda9-cd40-e52909242cda-78a6999f">
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd7cbc22419b32bb9d8d8_hcard%20-%20STABLE%20DIFFUSION.avif" loading="lazy" alt="" className="hr_img-stable-diff" />
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68349df097acbeb0e747fb60_Diffusion-diff_hero_mobile.avif" loading="lazy" alt="" className="hr_img-stable-diff-mobile" />
                        <div data-line-path="magnet" className="line-anchor start n3"></div>
                        <div className="line-anchor end n3"></div>
                    </div>
                    <div id="node5" node-connect-target="node6" node-connect-target-m="node6" className="hr-card-flux-2-1 node-connect w-node-ae4103dc-5e48-5c0c-7a06-82cd9453cae2-78a6999f">
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6837510acbe777269734b387_bird_desktop.avif" loading="lazy" alt="" className="hr_img-flux" />
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/683751c043700044e036204f_bird_mobile.avif" loading="lazy" alt="" className="hr_img-flux-mobile" />
                        <div className="line-anchor start n5"></div>
                        <div className="line-anchor end"></div>
                    </div>
                    <div id="node4" node-connect-target="node6" node-connect-target-m="" className="hr-card-text node-connect w-node-_0555fc31-2b1b-83e8-70ea-b785ee076d41-78a6999f">
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cde667778f6f5a7e80bf2_hcard%20-%20text.avif" loading="lazy" alt="" className="hr_img-prompt-st" />
                        <div data-line-path="magnet" className="line-anchor start"></div>
                        <div className="line-anchor end"></div>
                    </div>
                    <div id="node6" className="hr-card-minimax-video w-node-_0be630c0-22dc-cede-1dbf-f7e269927488-78a6999f">
                        <div className="hero-video">
                            <div className="line-anchor end n6"></div>
                            <div id="node6" className="hero-vid-embed w-embed">
                                <video autoPlay loop muted playsInline disablePictureInPicture preload="auto" style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
                                    <source
                                        src="https://assets.weavy.ai/homepage/hero/hero_video_mobile_342px.mp4"
                                        type="video/mp4"
                                        media="(max-width: 768px)"
                                    />
                                    <source
                                        src="https://assets.weavy.ai/homepage/hero/hero_video.mp4"
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6835ce8a653081a97d92eebd_VIDEO_hero_Desktop.avif" loading="lazy" alt="" className="hr_img-video" />
                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6835ce9cc9475b88f57c57da_VIDEO_hero_mobile.png"
                            loading="lazy" sizes="(max-width: 685px) 100vw, 685px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6835ce9cc9475b88f57c57da_VIDEO_hero_mobile-p-500.png 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6835ce9cc9475b88f57c57da_VIDEO_hero_mobile.png 685w"
                            alt="" className="hr_img-video-mobile" />
                    </div>
                </div>
            </div>
        </section>
    );
}
