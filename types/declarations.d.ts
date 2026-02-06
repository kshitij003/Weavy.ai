declare module 'fluent-ffmpeg';
declare module 'uuid';
declare module 'ffmpeg-static';
declare module 'ffprobe-static';

declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            src?: string;
            poster?: string;
            'camera-controls'?: boolean;
            'auto-rotate'?: boolean;
            'disable-zoom'?: boolean;
            'shadow-intensity'?: string;
            alt?: string;
            // Add other props as needed
        };
    }
}
