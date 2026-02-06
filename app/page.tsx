'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// -----------------------------------------------------------------------------
// ✅ CRITICAL FIX: Use Dynamic Imports with { ssr: false }
// This prevents the "ReferenceError: self is not defined" crash by ensuring
// these components are ONLY loaded in the browser, not during the server build.
// -----------------------------------------------------------------------------
const HeroSection = dynamic(() => import('@/components/HeroSection'), { ssr: false });
const ModelsSection = dynamic(() => import('@/components/ModelsSection'), { ssr: false });
const ToolsSection = dynamic(() => import('@/components/ToolsSection'), { ssr: false });
const OutcomeSection = dynamic(() => import('@/components/OutcomeSection'), { ssr: false });
const WorkflowSection = dynamic(() => import('@/components/WorkflowSection'), { ssr: false });
const WorkflowsSlider = dynamic(() => import('@/components/WorkflowsSlider'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

export default function Home() {
  // Optional: Prevent hydration mismatch if needed, though dynamic imports usually handle it.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Load all external scripts
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(null);
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initScripts = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/Draggable.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/leader-line/1.0.3/leader-line.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@splidejs/splide@latest/dist/js/splide.min.js');
        await loadScript('https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js');

        // Webflow dependencies
        await loadScript('https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=681b040781d5b5e278a69989');
        await loadScript('https://cdn.prod.website-files.com/681b040781d5b5e278a69989/js/webflow.schunk.e0c428ff9737f919.js');
        await loadScript('https://cdn.prod.website-files.com/681b040781d5b5e278a69989/js/webflow.schunk.dde2c6d4ef1627b8.js');
        await loadScript('https://cdn.prod.website-files.com/681b040781d5b5e278a69989/js/webflow.3a34c156.6bb9f3ec92cc8a2c.js');

        console.log('All scripts loaded successfully');

        // Initialize Lenis smooth scroll
        if ((window as any).Lenis && (window as any).gsap && (window as any).ScrollTrigger) {
          const lenis = new (window as any).Lenis({
            lerp: 0.1,
            wheelMultiplier: 0.9,
            gestureOrientation: 'vertical',
            normalizeWheel: false,
            smoothTouch: false
          });

          lenis.on('scroll', (window as any).ScrollTrigger.update);

          (window as any).gsap.ticker.add((time: number) => {
            lenis.raf(time * 1000);
          });

          (window as any).gsap.ticker.lagSmoothing(0);

          console.log('Lenis smooth scroll initialized');
        }

        // Navigation button shrink/grow animation
        if ((window as any).gsap && (window as any).ScrollTrigger) {
          const navButton = document.querySelector('.huge_nav-button.is-real');
          if (navButton) {
            (window as any).gsap.to(navButton, {
              scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: '+=100',
                scrub: true
              },
              scale: 0.85,
              ease: 'none'
            });
          }
        }
      } catch (error) {
        console.error('Script loading error:', error);
      }
    };

    initScripts();
  }, []);

  // Avoid rendering until mounted on client to prevent initial flicker or mismatch
  if (!isMounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        {/* Optional: Simple loader while scripts/components initialize */}
      </div>
    );
  }

  return (
    <>
      <div className="code_responsive-dom w-embed">
        <style dangerouslySetInnerHTML={{
          __html: `
          html, body {
            font-size: 1vw;
          }
          @media screen and (min-width: 1440px) {
            html, body {
              font-size: 14.4px;
            }
          }
          @media screen and (max-width: 600px) {
            html, body {
              font-size: 1.8vw;
            }
          }
        `}} />
      </div>
      <div className="page-wrapper">
        <div className="main-wrapper">
          {/* NAVIGATION */}
          <div data-wf--navbar--variant="with-banner---black" className="navbar_main">
            <section className="banner_component w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
              <div className="padding-global is-stretch-banner w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
                <div className="container-banner-top">
                  <div className="banner_wrapper w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
                    <div className="banner_small-image-wrapp w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
                      <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/69032e91ec29a8f27508fa9c_Image-Figma_acc.avif" loading="lazy" alt="" height="Auto" className="image-banner_small w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04" />
                    </div>
                    <div className="banner_content w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
                      <div className="banner_rich-text w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 w-richtext">
                        <p><strong>Weavy is now a part of Figma</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <div className="navbar-left w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
              <a href="/" aria-current="page" className="brand w-nav-brand w--current">
                <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682350d42a7c97b440a58480_Nav%20left%20item%20-%20DESKTOP.svg" loading="lazy" alt="" className="image_nav-logo-desktop" />
                <img src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682b76283538127bf3907ded_Frame%20427321089.svg" loading="lazy" alt="" height="30" className="image_nav-logo-mobile w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04" />
              </a>
            </div>
            <div className="navbar-right w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
              <div className="nav-bar-right">
                <div className="nav-links-wrapper">
                  <a href="/collective" className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 hide-mobile-landscape">COLLECTIVE</a>
                  <a href="/enterprise" className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 hide-mobile-landscape">ENTERPRISE</a>
                  <a href="/pricing" className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">Pricing</a>
                  <a href="https://form.typeform.com/to/VmiA3c6t?startpoint=intro?utm_source=top_bar&utm_medium=request_a_demo" target="_blank" className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 hide-mobile-landscape">Request a Demo</a>
                  <a href="/sign-in" className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">Sign In</a>
                </div>
              </div>
              <div className="navbar_main-cta-wrapper">
                <div className="huge_nav-button-dummy">
                  <div className="nav-button-spacer"></div>
                  <div className="nav-link-text-block-large nav-normal-case">Start Now</div>
                </div>
              </div>
            </div>
          </div>
          <a id="try_now_top" href="/sign-in" className="huge_nav-button is-real w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 w-inline-block">
            <div className="nav-button-spacer"></div>
            <div className="nav-link-text-block-large nav-normal-case">Start Now</div>
          </a>
        </div>

        {/* HERO SECTION */}
        <HeroSection />

        {/* MODELS SECTION */}
        <ModelsSection />

        {/* TOOLS SECTION */}
        <ToolsSection />

        {/* OUTCOME SECTION */}
        <OutcomeSection />

        {/* WORKFLOW SECTION */}
        <WorkflowSection />

        {/* WORKFLOWS SLIDER */}
        <WorkflowsSlider />

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
}