import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                poster?: string;
                'camera-controls'?: boolean;
                'auto-rotate'?: boolean;
                'disable-zoom'?: boolean;
                'disable-pan'?: boolean;
                'disable-tap'?: boolean;
                'shadow-intensity'?: string;
                'field-of-view'?: string;
                'exposure'?: string;
                'auto-rotate-delay'?: string;
                'rotation-per-second'?: string;
                'interaction-prompt'?: string;
                alt?: string;
                slot?: string;
            };
        }
    }
}
