const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Crop image endpoint
app.post('/crop', async (req, res) => {
    const { image, x, y, width, height } = req.body;

    if (!image || x === undefined || y === undefined || width === undefined || height === undefined) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `${uuidv4()}_input.png`);
    const outputPath = path.join(tmpDir, `${uuidv4()}_output.png`);

    try {
        // Save input image
        if (image.startsWith('data:')) {
            const base64Data = image.split(',')[1];
            await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
        } else if (image.startsWith('http')) {
            const response = await fetch(image);
            const arrayBuffer = await response.arrayBuffer();
            await fs.writeFile(inputPath, Buffer.from(arrayBuffer));
        } else {
            throw new Error('Invalid image format');
        }

        // Get image dimensions first
        const metadata = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        const stream = metadata.streams.find(s => s.codec_type === 'video');
        const imgWidth = stream.width;
        const imgHeight = stream.height;

        // Calculate pixel values from percentages
        const cropX = Math.floor((x / 100) * imgWidth);
        const cropY = Math.floor((y / 100) * imgHeight);
        const cropW = Math.floor((width / 100) * imgWidth);
        const cropH = Math.floor((height / 100) * imgHeight);

        // Crop image
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoFilters(`crop=${cropW}:${cropH}:${cropX}:${cropY}`)
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // Read and return base64
        const outputBuffer = await fs.readFile(outputPath);
        const base64Output = `data:image/png;base64,${outputBuffer.toString('base64')}`;

        res.json({ image: base64Output });

    } catch (error) {
        console.error('Crop error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        // Cleanup
        await fs.unlink(inputPath).catch(() => { });
        await fs.unlink(outputPath).catch(() => { });
    }
});

// Extract frame endpoint
app.post('/frame', async (req, res) => {
    const { video, timestamp, unit } = req.body;

    if (!video || timestamp === undefined || !unit) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `${uuidv4()}_input.mp4`);
    const outputPath = path.join(tmpDir, `${uuidv4()}_output.png`);

    try {
        // Save input video
        if (video.startsWith('data:')) {
            const base64Data = video.split(',')[1];
            await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
        } else if (video.startsWith('http')) {
            const response = await fetch(video);
            const arrayBuffer = await response.arrayBuffer();
            await fs.writeFile(inputPath, Buffer.from(arrayBuffer));
        } else {
            throw new Error('Invalid video format');
        }

        // Get video duration if needed
        let seekTime = timestamp;
        if (unit === 'percentage') {
            const metadata = await new Promise((resolve, reject) => {
                ffmpeg.ffprobe(inputPath, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            const duration = metadata.format.duration;
            seekTime = (timestamp / 100) * duration;
        }

        // Extract frame
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .seekInput(seekTime)
                .frames(1)
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // Read and return base64
        const outputBuffer = await fs.readFile(outputPath);
        const base64Output = `data:image/png;base64,${outputBuffer.toString('base64')}`;

        res.json({ image: base64Output });

    } catch (error) {
        console.error('Frame extraction error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        // Cleanup
        await fs.unlink(inputPath).catch(() => { });
        await fs.unlink(outputPath).catch(() => { });
    }
});

app.listen(PORT, () => {
    console.log(`FFmpeg worker running on port ${PORT}`);
});
