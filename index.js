/**
 * Requires these permissions:
 * - VIEW_CHANNEL
 * - CONNECT
 * - READ_MESSAGE_HISTORY
 * - MANAGE_THREADS
 * 
 * Requires these intents:
 * - GUILD_MEMBERS
 */

import 'dotenv/config';
import Bottleneck from 'bottleneck';

let requestUrl = 'https://discord.com/api/v10';
let token = process.env.DISCORD_TOKEN;
let guildId = process.env.DISCORD_GUILD_ID;

let requestOptions = {
    headers: {
        Authorization: `Bot ${token}`,
    },
};

let limiter = new Bottleneck({
    reservoir: 49,
    reservoirRefreshAmount: 49,
    reservoirRefreshInterval: 1000,
    maxConcurrent: 1,
});

const CHANNEL_TYPES = new Map(
    Object.entries({
        GUILD_TEXT: 0,
        DM: 1,
        GUILD_VOICE: 2,
        GROUP_DM: 3,
        GUILD_CATEGORY: 4,
        GUILD_ANNOUNCEMENT: 5,
        ANNOUNCEMENT_THREAD: 10,
        PUBLIC_THREAD: 11,
        PRIVATE_THREAD: 12,
        GUILD_STAGE_VOICE: 13,
        GUILD_DIRECTORY: 14,
        GUILD_FORUM: 15,
        GUILD_MEDIA: 16,
    })
);

async function main() {
    let channels = await getGuildChannels();
    
    /** @type {Map<string, boolean>} */
    let users = await getUsers();

    await Promise.all(channels.map(channel => processRecentUsersInChannel(channel, users)));
    
    /** @type {string[]} */
    let inactiveUserIds = getInactiveUsers(users);
    let inactiveUsers = await getUsersForIds(inactiveUserIds);
    
    inactiveUsers.forEach(user => {
        console.log(user.username + user.discriminator);
    });
}


main();

/**
 * @returns {Promise<*[]>}
 */
async function getGuildChannels() {
    let channels = [];

    let response = await limiter.schedule(() => {
        return fetch(`${requestUrl}/guilds/${guildId}/channels`, requestOptions);
    });
    channels = await response.json();

    let activeGuildThreadsResponse = await limiter.schedule(() => {
        return fetch(`${requestUrl}/guilds/${guildId}/threads`, requestOptions);
    });
    let activeGuildThreads = await activeGuildThreadsResponse.json();

    for (let i = 0; i < channels.length; i++) {
        let channel = channels[i];

        let inactiveThreadsForChannelResponse = await limiter.schedule(() => {
            return fetch(`${requestUrl}/channels/${channel.id}/threads`, requestOptions);
        });
        let inactiveThreadsForChannel = await inactiveThreadsForChannelResponse.json();

        channels.push(...inactiveThreadsForChannel);
    }

    channels.push(...activeGuildThreads);

    return channels;
}

/**
 * @returns {Promise<Map<any, boolean>>}
 */
async function getUsers() {
    let users = new Map();

    return users;
}

/**
 * @param {*} channel
 * @param {Map<string, boolean>} users
 */
async function processRecentUsersInChannel(channel, users) {
    let sixMonthsBack = false;
    let sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let cursor = '';

    while (!sixMonthsBack) {
        let messages = await getMessages(channel.id, cursor);

        for (let i = 0; i < messages.length; i++) {
            let message = messages[i];
            if (message.timestamp < sixMonthsAgo) {
                sixMonthsBack = true;
                break;
            }

            let user = message.author.id;

            if (users.has(user)) {
                users.set(user, true);
            }

            cursor = message.id;
        }
    }
}

/**
 * @param channel
 * @param cursor
 * @returns {Promise<*[]>}
 */
async function getMessages(channel, cursor) {
    let messages = [];

    return messages;
}

/**
 * @param {Map<string, boolean>} users
 * @returns {string[]}
 */
function getInactiveUsers(users) {
    let userIterator = users.entries();
    let inactiveUsers = [];
    for (let user = userIterator.next(); !user.done; user = userIterator.next()) {
        if (!user.value[1]) {
            inactiveUsers.push(user.value[0]);
        }
    }
    return inactiveUsers;    
}

/**
 * @param {string[]} userIds
 * @returns {Promise<string[]>}
 */
async function getUsersForIds(userIds) {
    let usernames = [];

    return usernames;
}