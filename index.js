import 'dotenv/config';
import Bottleneck from 'bottleneck';

let limiter = new Bottleneck({
    reservoir: 49,
    reservoirRefreshAmount: 49,
    reservoirRefreshInterval: 1000,
    maxConcurrent: 1,
});

async function main() {
    let channels = await getGuildChannels();
    
    /** @type {Map<string, boolean>} */
    let users = await getUsers();

    await Promise.all(channels.map(channel => processRecentUsersInChannel(channel, users)));

    /** @type {string[]} */
    let inactiveUserIds = getInactiveUsers(users);
    let inactiveUserUsernames = await getUsernamesForIds(inactiveUserIds);
    
    inactiveUserUsernames.forEach(username => {
        console.log(username);
    });
}


main();

/**
 * @returns {Promise<*[]>}
 */
async function getGuildChannels() {
    let channels = [];

    return channels;
}

/**
 * @returns {Promise<Map<any, boolean>>}
 */
async function getUsers() {
    let users = new Map();

    return users;
}

async function processRecentUsersInChannel(channel, allUsers) {
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

            if (allUsers.has(user)) {
                allUsers.set(user, true);
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
async function getUsernamesForIds(userIds) {
    let usernames = [];

    return usernames;
}