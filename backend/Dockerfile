# YAPÓ Backend: WebSocket (chat) + Wallet API
# Build: docker build -t yapo-backend .
# Run:   docker run -p 3001:3001 -p 3002:3002 -e WS_PORT=3001 -e WALLET_API_PORT=3002 yapo-backend

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY server.js wallet-api.js wallet-store.js start-cloud.js ./
# Si existe crypto-node.js u otros
COPY crypto-node.js* ./

EXPOSE 3001 3002

ENV WS_PORT=3001
ENV WALLET_API_PORT=3002

CMD ["node", "start-cloud.js"]
