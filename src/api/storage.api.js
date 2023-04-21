import { Database } from "../classes/index.js";
const store = new Map();

export async function storeDiscordTokens(userId, tokens) {
    store.set(`discord-${userId}`, tokens);
    await Database.User.updateOne(
        { id: userId },
        { $set: { Tokens: tokens } },
        { upsert: true }
    )
    return
}

export async function getDiscordTokens(userId) {
    const data = store.get(`discord-${userId}`)
        || await Database.User.findOne({ id: userId }, 'Tokens')
            .then(data => data.Tokens)
            .catch(() => undefined)

    return data;
}