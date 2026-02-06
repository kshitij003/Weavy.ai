'use client';

import { useEffect } from 'react';

export default function ModelsSection() {
    useEffect(() => {
        const initModelsScroll = () => {
            if (typeof window === 'undefined' || !window.gsap || !window.gsap.registerPlugin) {
                setTimeout(initModelsScroll, 100);
                return;
            }

            const gsap = window.gsap;
            const ScrollTrigger = window.ScrollTrigger;

            if (!ScrollTrigger) {
                setTimeout(initModelsScroll, 100);
                return;
            }

            gsap.registerPlugin(ScrollTrigger);

            const items = gsap.utils.toArray('.models_item');
            const backgrounds = gsap.utils.toArray('.models_bg-image');

            let lastIndex = -1;

            function activateItem(index) {
                if (index === lastIndex) return;
                lastIndex = index;

                const activeColor = "#f7ff9e";
                const inactiveColor = "#ffffff";

                backgrounds.forEach((bg, i) => {
                    const isActive = i === index;

                    gsap.to(bg, {
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1.02 : 1,
                        zIndex: isActive ? 1 : 0,
                        duration: 0.05,
                        ease: "power2.out"
                    });

                    const video = bg.querySelector("video");

                    if (video) {
                        try {
                            if (isActive) {
                                if (video.paused || video.readyState < 3) {
                                    video.muted = true;
                                    video.playsInline = true;
                                    video.setAttribute("playsinline", "");
                                    video.setAttribute("webkit-playsinline", "");
                                    video.play().catch(err => {
                                        console.warn("Autoplay blocked:", err);
                                    });
                                }
                            } else {
                                video.pause();
                                video.currentTime = 0;
                            }
                        } catch (e) {
                            console.warn("Video playback error:", e);
                        }
                    }
                });

                items.forEach((el, i) => {
                    gsap.to(el, {
                        color: i === index ? activeColor : inactiveColor,
                        duration: 0.08,
                        ease: "power1.out"
                    });
                });
            }

            const isMobile = window.innerWidth <= 768;

            items.forEach((item, i) => {
                ScrollTrigger.create({
                    trigger: item,
                    start: isMobile ? 'top 40%' : 'top 20%',
                    end: isMobile ? 'bottom center' : 'bottom center',
                    onEnter: () => activateItem(i),
                    onEnterBack: () => activateItem(i)
                });
            });

            // Fallback activation on page load
            window.addEventListener('load', () => {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY || window.pageYOffset;
                    const viewportHeight = window.innerHeight;
                    let found = false;

                    items.forEach((item, i) => {
                        const rect = item.getBoundingClientRect();
                        const top = rect.top + scrollY;
                        const bottom = top + rect.height;
                        const inView = top < (scrollY + viewportHeight) && bottom > scrollY;

                        if (inView && !found) {
                            activateItem(i);
                            found = true;
                        }
                    });

                    if (!found && items.length) {
                        activateItem(0);
                    }
                });
            });
        };

        setTimeout(initModelsScroll, 500);
    }, []);

    const videoStyle = {
        position: 'absolute' as const,
        zIndex: -1,
        display: 'inline-block',
        width: '100vw',
        height: '100vh',
        transform: 'scale(1.05)',
        transitionProperty: 'all',
        transitionDuration: '22ms',
        transitionTimingFunction: 'linear',
        objectFit: 'cover' as const,
        pointerEvents: 'none' as const
    };

    return (
        <section className="section_models text-color-white">
            <div className="layout355_component">
                <div className="padding-global">
                    <div className="container-large">
                        <div className="padding-section-large is-models">
                            <div className="layout62_component">
                                <div className="w-layout-grid models_content">
                                    <div className="models_content-left">
                                        <h2 className="heading-style-xl">Use all AI models, together at last</h2>
                                        <p className="paragraph-line-height-1-15 text-size-large">AI models and professional editing tools in one node-based platform. Turn creative vision into scalable workflows without compromising quality.</p>
                                    </div>
                                    <div className="models_content-right">
                                        <div className="w-layout-grid models_item-list">
                                            <div className="models_item is-active">
                                                <h3 className="heading-style-xl pointer-events-none">GPT img 1</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Wan</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">SD 3.5</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Runway Gen-4</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Imagen 3</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Veo 3</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Recraft V3</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Kling</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Flux Pro 1.1 Ultra</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Minimax video</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Ideogram V3</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Luma ray 2</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Minimax image 01</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Hunyuan</h3>
                                            </div>
                                            <div className="models_item">
                                                <h3 className="heading-style-xl pointer-events-none">Bria</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mobile-models-ix-trigger"></div>
                                </div>
                            </div>
                        </div>
                        <div className="models_space-reducer"></div>
                    </div>
                </div>
                <div className="models_bg-image-layer">
                    <div className="image-overlay-layer"></div>
                    <img loading="eager" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887e82ac8a8bb8139ebd_GPT%20img%201.avif" alt="" className="models_bg-image active" />
                    <div className="models_bg-image w-embed">
                        <video autoPlay muted loop playsInline style={videoStyle}>
                            <source src="https://assets.weavy.ai/homepage/mobile-videos/wan.mp4" type="video/mp4" media="(max-width: 768px)" />
                            <source src="https://assets.weavy.ai/homepage/videos/wan.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887d618a9071dd147d5f_SD%203.5.avif" alt="" className="models_bg-image" />
                    <div className="models_bg-image w-embed">
                        <video autoPlay muted loop playsInline preload="auto" disablePictureInPicture style={videoStyle}>
                            <source src="https://assets.weavy.ai/homepage/mobile-videos/runway.mp4" type="video/mp4" media="(max-width: 768px)" />
                            <source src="https://assets.weavy.ai/homepage/videos/runway_gen-4.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887d65bf65cc5194ac05_Imagen%203.avif" alt="" className="models_bg-image" />
                    <div className="models_bg-image w-embed">
                        <video autoPlay muted loop playsInline preload="auto" disablePictureInPicture style={videoStyle}>
                            <source src="https://assets.weavy.ai/homepage/mobile-videos/veo2.mp4" type="video/mp4" media="(max-width: 768px)" />
                            <source src="https://assets.weavy.ai/homepage/videos/Veo2.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887eda73c12eaa4c3ed8_Recraft%20V3.avif" alt="" className="models_bg-image" />
                    <div className="models_bg-image w-embed">
                        <video autoPlay muted loop playsInline preload="auto" disablePictureInPicture style={videoStyle}>
                            <source src="https://assets.weavy.ai/homepage/mobile-videos/kling.mp4" type="video/mp4" media="(max-width: 768px)" />
                            <source src="https://assets.weavy.ai/homepage/videos/kling.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887d8a7b4e937a86ea6a_Flux%20Pro%201.1%20Ultra.avif" alt="" className="models_bg-image" />
                    <div className="models_bg-image w-embed">
                        <video autoPlay muted loop playsInline preload="auto" disablePictureInPicture style={videoStyle}>
                            <source src="https://assets.weavy.ai/homepage/mobile-videos/minimax.mp4" type="video/mp4" media="(max-width: 768px)" />
                            <source src="https://assets.weavy.ai/homepage/videos/minimax_video.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887d9b7eb0abc91263b6_Ideogram%20V2.avif" alt="" className="models_bg-image" />
                    <div className="models_bg-image w-embed">
                        <video autoPlay muted loop playsInline preload="auto" disablePictureInPicture style={videoStyle}>
                            <source src="https://assets.weavy.ai/homepage/mobile-videos/luma_raw_2.mp4" type="video/mp4" media="(max-width: 768px)" />
                            <source src="https://assets.weavy.ai/homepage/videos/luma_ray_2.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68258880f266d11a0748ab63_Minimax%20image%2001.avif" alt="" className="models_bg-image" />
                    <div className="models_bg-image w-embed">
                        <video autoPlay muted loop playsInline preload="auto" disablePictureInPicture style={videoStyle}>
                            <source src="https://assets.weavy.ai/homepage/mobile-videos/hunyuan.mp4" type="video/mp4" media="(max-width: 768px)" />
                            <source src="https://assets.weavy.ai/homepage/videos/hunyuan.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887d59ff2f86b8fba523_Bria.avif" alt="" className="models_bg-image" />
                    <div className="overlay-section-top"></div>
                </div>
            </div>
        </section>
    );
}
