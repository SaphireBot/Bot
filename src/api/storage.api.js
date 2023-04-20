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
    let data = store.get(`discord-${userId}`);

    if (!data) {
        const request = await Database.User.findOne({ id: userId }, 'Tokens')
        data = request.Tokens
    }

    return data;
}