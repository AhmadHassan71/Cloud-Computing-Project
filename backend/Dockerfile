FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install build dependencies needed for bcrypt
RUN apk add --no-cache python3 make g++ git

# Install node-pre-gyp globally
RUN npm install -g node-pre-gyp

# Enhanced npm configuration to handle network issues and corrupted tarballs
RUN npm cache clean --force && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies with increased network timeout
RUN npm install --network-timeout=300000

# Bundle app source
COPY . .

# Create directories for uploads and generated PDFs if they don't exist
RUN mkdir -p docs uploads

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "run", "server"]