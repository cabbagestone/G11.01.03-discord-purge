# Discord Purge Script

This script takes a guild id and token from the environment, and lists all users that were not active in the last 6
months. (username + discriminator)

requires the following permissions:
- VIEW_CHANNEL
- CONNECT
- READ_MESSAGE_HISTORY
- MANAGE_THREADS

requires the following privileged intents:
- GUILD_MEMBERS