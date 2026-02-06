'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        Splide: any;
    }
}

export default function WorkflowsSlider() {
    useEffect(() => {
        const initSlider = () => {
            if (typeof window === 'undefined' || !window.Splide) {
                setTimeout(initSlider, 100);
                return;
            }

            const slider = new window.Splide('.splide.slider2.tall', {
                type: 'loop',
                perPage: 3,
                perMove: 1,
                gap: '2em',
                pagination: false,
                arrows: true,
                start: 1,
                focus: 'center',
                trimSpace: false,
                breakpoints: {
                    991: {
                        perPage: 1,
                        gap: '1em'
                    }
                }
            });

            slider.mount();
        };

        setTimeout(initSlider, 1000);
    }, []);

    return (
        <section className="section_workflows-slider">
            <div className="padding-global">
                <div className="simple-container">
                    <div className="padding-section-large is-workflows">
                        <div className="layout_left-align">
                            <div className="workflows-header-wrppaer">
                                <h2 className="heading-style-xl">Explore Our Workflows</h2>
                                <p className="paragraph-line-height-1-15">From multi-layer compositing to matte manipulation, Weavy keeps up with your creativity with all the editing tools you recognize and rely on.</p>
                            </div>
                        </div>
                        <div className="container">
                            <div className="slider-css w-embed">
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                  .splide button:disabled {
                    opacity: 0.4;
                  }

                  .is--dark .splide__arrow {
                    filter: invert(100%);
                  }

                  .is--dark .splide__pagination__page {
                    background-color: #dfdad5;
                  }

                  .splide.pill .splide__pagination {
                    display: none;
                  }

                  .splide__slide.is-active .slider-pill_photo {
                    transform: scale(1.05);
                  }

                  .splide.tall .splide__pagination {
                    display: none;
                  }

                  .splide__slide.is-active .text-opacity {
                    color: white;
                  }

                  .splide__slide.is-active:hover .text-opacity {
                    color: #f7ff9e;
                  }

                  .splide__slide.is-active .slider-tall_img {
                    transform: scale(1.05);
                  }

                  .splide__slide.is-active .slider-tall_photo {
                    transform: scale(1.05);
                  }

                  .splide__slide.is-active .rounded {
                    border-radius: 0.75em;
                  }
                `}} />
                            </div>
                            <div className="splide slider2 tall">
                                <div className="splide__track">
                                    <div className="splide__list">
                                        <div className="splide__slide three-cards">
                                            <div className="slider-tall center">
                                                <div className="text-opacity">
                                                    <h3 className="slider_heading">Multiple Models</h3>
                                                </div>
                                                <div className="slider-tall_img rounded">
                                                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif" alt="" sizes="(max-width: 840px) 100vw, 840px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif 840w" className="slider-tall_photo" />
                                                    <a href="https://app.weavy.ai/recipe/dIjHiwG4WWVtodBraoA2" target="_blank" className="slider_button w-inline-block">
                                                        <div>Try</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="splide__slide three-cards is-active">
                                            <div className="slider-tall center">
                                                <div className="text-opacity">
                                                    <h3 className="slider_heading">Wan LoRa Inflate</h3>
                                                </div>
                                                <div className="slider-tall_img rounded">
                                                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif" alt="" sizes="(max-width: 991px) 100vw, 926.0999755859375px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif 840w" className="slider-tall_photo" />
                                                    <a href="https://app.weavy.ai/flow/ajkQsnEdST1Y9ymyTYaZ" target="_blank" className="slider_button w-inline-block">
                                                        <div>Try</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="splide__slide three-cards">
                                            <div className="slider-tall center">
                                                <div className="text-opacity">
                                                    <h3 className="slider_heading">ControlNet - Structure Reference</h3>
                                                </div>
                                                <div className="slider-tall_img rounded">
                                                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif" alt="" sizes="(max-width: 840px) 100vw, 840px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif 840w" className="slider-tall_photo" />
                                                    <a href="https://app.weavy.ai/recipe/lmQ3o3xBQw336nCQx6ee" target="_blank" className="slider_button w-inline-block">
                                                        <div>Try</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="splide__slide three-cards">
                                            <div className="slider-tall center">
                                                <div className="text-opacity">
                                                    <h3 className="slider_heading">Wan Lora - LoRA Rotate 90</h3>
                                                </div>
                                                <div className="slider-tall_img rounded">
                                                    <img loading="lazy" src="./public/6825b0acc901ee5c718efc90_Wan Lora - Rotate.avif" alt="" sizes="(max-width: 840px) 100vw, 840px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac87a4e0d0e3c6fb96_Wan%20Lora%20-%20LoRA%20Rotate%2090-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac87a4e0d0e3c6fb96_Wan%20Lora%20-%20LoRA%20Rotate%2090-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac87a4e0d0e3c6fb96_Wan%20Lora%20-%20LoRA%20Rotate%2090.avif 840w" className="slider-tall_photo" />
                                                    <a href="https://app.weavy.ai/recipe/Qb6FZED3Fzo24xdoJ98h" target="_blank" className="slider_button w-inline-block">
                                                        <div>Try</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div> */}
                                        <div className="splide__slide three-cards">
                                            <div className="slider-tall center">
                                                <div className="text-opacity">
                                                    <h3 className="slider_heading">Weavy Logo</h3>
                                                </div>
                                                <div className="slider-tall_img rounded">
                                                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo.avif" alt="" sizes="(max-width: 840px) 100vw, 840px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo.avif 840w" className="slider-tall_photo" />
                                                    <a href="https://app.weavy.ai/recipe/XvULalxaRR01K0RA1T0Kqx?view=workflow" target="_blank" className="slider_button w-inline-block">
                                                        <div>Try</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="splide__slide three-cards">
                                            <div className="slider-tall center">
                                                <div className="text-opacity">
                                                    <h3 className="slider_heading">Relight - Product</h3>
                                                </div>
                                                <div className="slider-tall_img rounded">
                                                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product.avif" alt="" sizes="(max-width: 840px) 100vw, 840px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product.avif 840w" className="slider-tall_photo" />
                                                    <a href="https://app.weavy.ai/recipe/oOuwYBIffBhSc2PKxJWL" target="_blank" className="slider_button w-inline-block">
                                                        <div>Try</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="splide__slide three-cards">
                                            <div className="slider-tall center">
                                                <div className="text-opacity">
                                                    <h3 className="slider_heading">Wan Lora - Rotate</h3>
                                                </div>
                                                <div className="slider-tall_img rounded">
                                                    <img loading="lazy" src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate.avif" alt="" sizes="(max-width: 840px) 100vw, 840px" srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate.avif 840w" className="slider-tall_photo" />
                                                    <a href="https://app.weavy.ai/recipe/4IFNep5XnzgCzv84NN4R" target="_blank" className="slider_button w-inline-block">
                                                        <div>Try</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="splide__arrows hide-mobile-landscape">
                                    <div className="embed w-embed"><button className="splide__arrow splide__arrow--prev"></button></div>
                                    <div className="embed w-embed"><button className="splide__arrow splide__arrow--next"></button></div>
                                    <div className="hide">
                                        <div className="splide__arrow splide__arrow--prev"></div>
                                        <div className="splide__arrow splide__arrow--next"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
