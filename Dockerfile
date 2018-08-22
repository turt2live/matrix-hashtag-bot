FROM node:alpine
COPY . /tmp/src
RUN cd /tmp/src \
    && npm install \
    && npm run build \
    && mv lib/ /matrix-hashtag-bot/ \
    && mv node_modules / \
    && cd / \
    && rm -rf /tmp/*

ENV NODE_ENV=production
ENV NODE_CONFIG_DIR=/data/config

# We want to make sure that the user can't configure these wrong
ENV BOT_DATA_PATH=/data/storage
ENV BOT_DOCKER_LOGS=true

CMD node /matrix-hashtag-bot/index.js
VOLUME ["/data"]
EXPOSE 4502