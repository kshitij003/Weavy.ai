'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        gsap: any;
        Splide: any;
    }
}

export default function ToolsSection() {
    useEffect(() => {
        const initTools = () => {
            if (typeof window === 'undefined' || !window.gsap || !window.Splide) {
                setTimeout(initTools, 100);
                return;
            }

            // --- DESKTOP INTERCEPTIONS ---
            const toolChips = document.querySelectorAll(".prof-tools-chips-comp > div");
            const picElems = document.querySelectorAll(".prof_center-image-wrapp > img");
            const defaultPic = document.querySelector(".prof_center-image-wrapp .is-default");

            function showDefaultImage() {
                picElems.forEach(pic => {
                    window.gsap.killTweensOf(pic);
                    const isDefault = pic === defaultPic;
                    window.gsap.to(pic, {
                        opacity: isDefault ? 1 : 0,
                        duration: isDefault ? 0.15 : 0.075
                    });
                });

                toolChips.forEach(el => {
                    window.gsap.to(el, {
                        opacity: 1,
                        duration: 0.075
                    });
                });
            }

            // Desktop Hover Logic
            if (toolChips.length > 0) {
                toolChips.forEach(chip => {
                    chip.addEventListener("mouseenter", () => {
                        const matchClass = Array.from(chip.classList).find(cls => cls.startsWith("is-"));
                        if (!matchClass) return;

                        toolChips.forEach(other => {
                            if (other !== chip) {
                                window.gsap.to(other, {
                                    opacity: 0.67,
                                    duration: 0.075
                                });
                            }
                        });

                        picElems.forEach(pic => {
                            window.gsap.killTweensOf(pic);
                            const isMatch = pic.classList.contains(matchClass);
                            window.gsap.to(pic, {
                                opacity: isMatch ? 1 : 0,
                                duration: isMatch ? 0.15 : 0.075
                            });
                        });
                    });

                    chip.addEventListener("mouseleave", () => {
                        showDefaultImage();
                    });
                });

                const observerTarget = document.querySelector(".prof-tools-chips-comp");
                if (observerTarget) {
                    const observer = new IntersectionObserver(
                        entries => {
                            entries.forEach(entry => {
                                if (!entry.isIntersecting) {
                                    showDefaultImage();
                                }
                            });
                        }, {
                        threshold: 0.1
                    }
                    );

                    observer.observe(observerTarget);
                }
            }

            // --- MOBILE SPLIDE SLIDERS ---
            const mobileSliderEl = document.querySelector('.splide.tools-image');
            const mobileTagsEl = document.querySelector('.splide.tool-tags');

            if (mobileSliderEl && mobileTagsEl) {
                // Tools Image Slider (Fade)
                const imageSlider = new window.Splide('.splide.tools-image', {
                    type: 'fade',
                    rewind: true,
                    arrows: false,
                    pagination: false,
                    drag: false,
                    speed: 500,
                    perMove: 1,
                });

                // Tool Tags Slider (Navigation Chips)
                const tagSlider = new window.Splide('.splide.tool-tags', {
                    type: 'loop',
                    isNavigation: true,
                    focus: 'center',
                    perPage: 3,
                    perMove: 1,
                    flickMaxPages: 1,
                    flickPower: 200,
                    gap: '2rem',
                    arrows: false,
                    pagination: false,
                    breakpoints: {
                        767: {
                            perPage: 3,
                            gap: '1rem'
                        },
                        479: {
                            perPage: 2,
                            gap: '2rem'
                        }
                    }
                });

                // Active State Logic
                tagSlider.on('move', () => {
                    document.querySelectorAll('.slide_super-chip').forEach((chip: any) => {
                        chip.style.backgroundColor = '#fff';
                    });

                    const activeSlide = tagSlider.Components.Slides.getAt(tagSlider.index);
                    if (activeSlide) {
                        const activeChip = activeSlide.slide.querySelector('.slide_super-chip');
                        if (activeChip) {
                            activeChip.style.backgroundColor = '#F7FF9E';
                        }
                    }
                });

                imageSlider.sync(tagSlider);
                imageSlider.mount();
                tagSlider.mount();
            }
        };

        setTimeout(initTools, 500);
    }, []);

    return (
        <>
            <section className="section_prof-tools">
                <div className="padding-global">
                    <div className="simple-container">
                        <div className="padding-section-large">
                            <div className="outcome_comp">
                                <div className="tools-header-wrapper">
                                    <h2 className="heading-style-xl">With all the professional tools you rely on</h2>
                                    <p className="text-size-large">In one seamless workflow</p>
                                </div>
                                <div className="prof-tools-interactionable-wrapper">
                                    <div className="prof_center-image-wrapp">
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68223c9e9705b88c35e76dec_Default%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68223c9e9705b88c35e76dec_Default%402x-p-500.png 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68223c9e9705b88c35e76dec_Default%402x-p-800.png 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68223c9e9705b88c35e76dec_Default%402x.avif 2880w" alt="" className="image-tools-inner is-default" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224564b78bd840120b7a38_Blur%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224564b78bd840120b7a38_Blur%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224564b78bd840120b7a38_Blur%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224564b78bd840120b7a38_Blur%402x.avif 2880w" alt="" className="image-tools-inner is-blur" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d93b3ce65b54f07b_Invert%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d93b3ce65b54f07b_Invert%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d93b3ce65b54f07b_Invert%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d93b3ce65b54f07b_Invert%402x-p-1080.avif 1080w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d93b3ce65b54f07b_Invert%402x-p-1600.avif 1600w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d93b3ce65b54f07b_Invert%402x.avif 2880w" alt="" className="image-tools-inner is-invert" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563af147b5d7c2496ff_Crop%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563af147b5d7c2496ff_Crop%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563af147b5d7c2496ff_Crop%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563af147b5d7c2496ff_Crop%402x-p-1080.avif 1080w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563af147b5d7c2496ff_Crop%402x-p-1600.avif 1600w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563af147b5d7c2496ff_Crop%402x.avif 2880w" alt="" className="image-tools-inner is-crop" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d5cb54c747f189ae_Mask%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d5cb54c747f189ae_Mask%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d5cb54c747f189ae_Mask%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d5cb54c747f189ae_Mask%402x-p-1080.avif 1080w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d5cb54c747f189ae_Mask%402x-p-1600.avif 1600w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d5cb54c747f189ae_Mask%402x-p-2000.avif 2000w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d5cb54c747f189ae_Mask%402x.avif 2880w" alt="" className="image-tools-inner is-mask-extractor" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245639e16941f61edcc06_Inpaint%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245639e16941f61edcc06_Inpaint%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245639e16941f61edcc06_Inpaint%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245639e16941f61edcc06_Inpaint%402x-p-1080.avif 1080w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245639e16941f61edcc06_Inpaint%402x.avif 2880w" alt="" className="image-tools-inner is-inpaint" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245634dee7dac1dc3ac42_Painter%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245634dee7dac1dc3ac42_Painter%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245634dee7dac1dc3ac42_Painter%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245634dee7dac1dc3ac42_Painter%402x-p-1080.avif 1080w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245634dee7dac1dc3ac42_Painter%402x-p-1600.avif 1600w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245634dee7dac1dc3ac42_Painter%402x-p-2000.avif 2000w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245634dee7dac1dc3ac42_Painter%402x.avif 2880w" alt="" className="image-tools-inner is-painter" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563b4846eaa2d70f69e_Relight%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563b4846eaa2d70f69e_Relight%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563b4846eaa2d70f69e_Relight%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563b4846eaa2d70f69e_Relight%402x-p-1080.avif 1080w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563b4846eaa2d70f69e_Relight%402x-p-1600.avif 1600w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563b4846eaa2d70f69e_Relight%402x.avif 2880w" alt="" className="image-tools-inner is-relight" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245638e6550c59d0bce8f_Upscale%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245638e6550c59d0bce8f_Upscale%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245638e6550c59d0bce8f_Upscale%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245638e6550c59d0bce8f_Upscale%402x-p-1080.avif 1080w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245638e6550c59d0bce8f_Upscale%402x-p-1600.avif 1600w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245638e6550c59d0bce8f_Upscale%402x.avif 2880w" alt="" className="image-tools-inner is-upscale" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563290cc77eba8f086a_z%20depth%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563290cc77eba8f086a_z%20depth%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563290cc77eba8f086a_z%20depth%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563290cc77eba8f086a_z%20depth%402x.avif 2880w" alt="" className="image-tools-inner is-zdepth" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245646909d06ed8a17f4d_Channels%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245646909d06ed8a17f4d_Channels%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245646909d06ed8a17f4d_Channels%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245646909d06ed8a17f4d_Channels%402x-p-1080.avif 1080w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245646909d06ed8a17f4d_Channels%402x-p-1600.avif 1600w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245646909d06ed8a17f4d_Channels%402x.avif 2880w" alt="" className="image-tools-inner is-channels" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6822456436dd3ce4b39b6372_Outpaint%402x.avif" loading="lazy" sizes="(max-width: 2880px) 100vw, 2880px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6822456436dd3ce4b39b6372_Outpaint%402x-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6822456436dd3ce4b39b6372_Outpaint%402x-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6822456436dd3ce4b39b6372_Outpaint%402x-p-1080.avif 1080w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6822456436dd3ce4b39b6372_Outpaint%402x.avif 2880w" alt="" className="image-tools-inner is-outpaint" />
                                        <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825ab42a8f361a9518d5a7f_Image%20describer%402x.avif" loading="lazy" alt="" className="image-tools-inner is-image-describer" />
                                    </div>
                                    <div className="prof-tools-chips-comp">
                                        <div className="tool_chip is-invert">
                                            <div className="pointer-events-none">Invert</div>
                                        </div>
                                        <div className="tool_chip is-outpaint">
                                            <div className="pointer-events-none">outpaint</div>
                                        </div>
                                        <div className="tool_chip is-crop">
                                            <div className="pointer-events-none">Crop</div>
                                        </div>
                                        <div className="tool_chip is-inpaint">
                                            <div className="pointer-events-none">Inpaint</div>
                                        </div>
                                        <div className="tool_chip is-mask-extractor">
                                            <div className="pointer-events-none">Mask extractor</div>
                                        </div>
                                        <div className="tool_chip is-upscale">
                                            <div className="pointer-events-none">upscale</div>
                                        </div>
                                        <div className="tool_chip is-zdepth">
                                            <div className="pointer-events-none">z depth extractor</div>
                                        </div>
                                        <div className="tool_chip is-image-describer">
                                            <div className="pointer-events-none">image describer</div>
                                        </div>
                                        <div className="tool_chip is-channels">
                                            <div className="pointer-events-none">channels</div>
                                        </div>
                                        <div className="tool_chip is-painter">
                                            <div className="pointer-events-none">Painter</div>
                                        </div>
                                        <div className="tool_chip is-relight">
                                            <div className="pointer-events-none">Relight</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section_prof-tools-mobile">
                <div className="padding-global">
                    <div className="simple-container is-blend-on-mobile">
                        <div className="padding-section-large is-tools">
                            <div className="outcome_comp is-z-index-3">
                                <div className="tools-header-wrapper is-blend-mode">
                                    <h2 className="heading-style-xl">With all the professional tools you rely on</h2>
                                    <p className="text-size-large">In one seamless workflow</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tools_mobile-slider-comp">
                    <div id="tools-slider" className="splide tools-image">
                        <div className="splide__track is-mobile-tools-slider">
                            <div className="splide__list">
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7885ff7357d922037c4_default_mobile.avif" alt="" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e788be2ac396b9541c65_describer_mobile.avif" alt="" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e78866ed64acde74b76f_outpaint_mobile.avif" alt="" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img sizes="(max-width: 780px) 100vw, 780px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e788cefffba35a0c82c7_channels_mobile-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e788cefffba35a0c82c7_channels_mobile.avif 780w" alt="" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e788cefffba35a0c82c7_channels_mobile.avif" loading="lazy" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img sizes="(max-width: 780px) 100vw, 780px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7884430f4f3b0c734c6_upscale_mobile-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7884430f4f3b0c734c6_upscale_mobile.avif 780w" alt="" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7884430f4f3b0c734c6_upscale_mobile.avif" loading="lazy" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e788ab51aaa475d32e51_zdepth_mobile.avif" alt="" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img sizes="(max-width: 780px) 100vw, 780px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7885d8ba650e91f8316_relight_mobile-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7885d8ba650e91f8316_relight_mobile.avif 780w" alt="" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7885d8ba650e91f8316_relight_mobile.avif" loading="lazy" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img sizes="(max-width: 780px) 100vw, 780px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7880866814b85054b1a_paint_mobile-p-500.png 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7880866814b85054b1a_paint_mobile.png 780w" alt="" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7880866814b85054b1a_paint_mobile.png" loading="lazy" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img sizes="(max-width: 780px) 100vw, 780px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7884f0847f3535d693c_crop_mobile-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7884f0847f3535d693c_crop_mobile.avif 780w" alt="" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7884f0847f3535d693c_crop_mobile.avif" loading="lazy" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img sizes="(max-width: 780px) 100vw, 780px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7888d228f3f01ac4e1a_invert_mobile-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7888d228f3f01ac4e1a_invert_mobile.avif 780w" alt="" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7888d228f3f01ac4e1a_invert_mobile.avif" loading="lazy" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slider-pill">
                                        <div className="slider-pill_img"><img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6836e7883a7cdd793a674313_inpaint_mobile.avif" alt="" className="slider-pill_photo" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tool-chips" className="splide tool-tags">
                        <div className="splide__track is-text-tags">
                            <div className="splide__list">
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">Default</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">Describer</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">Outpaint</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">Channels</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">upscale</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">z depth extractor</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">Relight</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">Painter</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">Crop</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">Invert</h3>
                                    </div>
                                </div>
                                <div className="splide__slide">
                                    <div className="slide_super-chip-wrapper">
                                        <h3 className="slide_super-chip">Inpaint</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="splide__arrows is--mobile-center">
                            <div className="embed w-embed"><button className="splide__arrow splide__arrow--prev"></button></div>
                            <div className="embed w-embed"><button className="splide__arrow splide__arrow--next"></button></div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
