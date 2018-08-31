# matrix-hashtag-bot

[![TravisCI badge](https://travis-ci.org/turt2live/matrix-hashtag-bot.svg?branch=master)](https://travis-ci.org/turt2live/matrix-hashtag-bot)

When a hashtag is mentioned, this bot creates a Matrix group. 

Questions? Ask away in [#hashtagbot:t2bot.io](https://matrix.to/#/#hashtagbot:t2bot.io)

This is a **silly bot**, and a absurd usage of the groups API. Using it for #serious #business is discouraged.

# Usage

1. Invite `@hashtag:t2bot.io` to a room
2. Send a message like `#sillybots`

# Building your own

*Note*: You'll need to have access to an account that the bot can use to get the access token.

1. Clone this repository
2. `npm install`
3. `npm run build`
3. Copy `config/default.yaml` to `config/production.yaml`
4. Run the bot with `NODE_ENV=production node lib/index.js`

### Docker

```
# Create the directory structure
# This is all the information kept in the volume: config, logs, and cache
mkdir -p /matrix-hashtag-bot/config
mkdir -p /matrix-hashtag-bot/logs
mkdir -p /matrix-hashtag-bot/storage

# Create the configuration file. Use the default configration as a template.
# Be sure to change the log path to /data/logs
# Be sure to point the dataPath at /data/storage
nano /matrix-hashtag-bot/config/production.yaml

# Run the container
docker run -v /matrix-hashtag-bot:/data turt2live/matrix-hashtag-bot
```
