declare module '@ffmpeg/ffmpeg' {
    export class FFmpeg {
        loaded: boolean;
        load(options: {
            coreURL: string;
            wasmURL: string;
        }): Promise<void>;
        writeFile(path: string, data: Uint8Array | Buffer): Promise<void>;
        readFile(path: string): Promise<Uint8Array>;
        exec(args: string[]): Promise<void>;
        on(event: 'log', callback: (data: { message: string }) => void): void;
        terminate(): Promise<void>;
    }
}

declare module '@ffmpeg/util' {
    export function fetchFile(source: string | File | Blob): Promise<Uint8Array>;
    export function toBlobURL(url: string, mimeType: string): Promise<string>;
}

declare module 'uuid' {
    export function v4(): string;
}
