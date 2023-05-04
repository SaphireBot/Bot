import { Database } from "../classes/index.js";
const store = new Map();

export async function storeDiscordTokens(userId, tokens) {
    store.set(`discord-${userId}`, tokens);
    await Database.User.findOneAndUpdate(
        { id: userId },
        { $set: { Tokens: tokens } },
        { upsert: true, new: true }
    )
        .then(doc => Database.saveUserCache(doc?.id, doc))
    return
}

export async function getDiscordTokens(userId) {
    const data = store.get(`discord-${userId}`)
        || await Database.getUser(userId)
            .then(data => data.Tokens)
            .catch(() => undefined)

    return data;
}