declare module 'fluent-ffmpeg' {
    const ffmpeg: any;
    export default ffmpeg;
}

declare module '@ffmpeg-installer/ffmpeg' {
    export const path: string;
    export const version: string;
}

declare module 'uuid' {
    export function v4(): string;
}
