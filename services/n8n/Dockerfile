# Use the official n8n image as the base
FROM n8nio/n8n:latest

# Switch to the root user to install extra packages
USER root

# Install the desired npm package locally in the container
RUN npm install sitemap-urls

# Switch back to the n8n default non-root user
USER node
