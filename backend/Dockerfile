FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.mjs ./
ENV PORT=8787 PRIVATE_DATA_DIR=/data
RUN mkdir /data && chown -R node:node /data /app
USER node
EXPOSE 8787
CMD ["node","server.mjs"]
