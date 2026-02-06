declare module 'fluent-ffmpeg' {
    const ffmpeg: any;
    export default ffmpeg;
}

declare module 'ffmpeg-static' {
    const ffmpegPath: string | null;
    export default ffmpegPath;
}

declare module 'ffprobe-static' {
    export const path: string;
}

declare module 'uuid' {
    export function v4(): string;
}
