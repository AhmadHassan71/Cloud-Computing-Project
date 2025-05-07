FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy all files
COPY . .

# Build the React application
RUN npm run build

# Production environment
FROM nginx:alpine

# Copy build files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY default.conf /etc/nginx/templates/default.conf.template

# Add environment variable for backend URL (default can be overridden at runtime)
ENV BACKEND_HOST=localhost


# Expose port 80
EXPOSE 80

# Start Nginx with environment variable substitution
CMD ["/bin/sh", "-c", "envsubst '$$BACKEND_HOST' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]