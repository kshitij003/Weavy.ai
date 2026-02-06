# Use Node.js with Alpine for smaller image size
FROM node:20-alpine

# Install FFmpeg and FFprobe
RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
