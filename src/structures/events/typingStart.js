import { SaphireClient as client } from "../../classes/index.js";
import { FastTypesGames } from "../commands/slash/games/fasttype.js";

client.on("typingStart", typing => {
    const { channel, user, startedTimestamp } = typing
    if (!FastTypesGames[`${channel.id}_${user.id}.startedAt`]) return
    FastTypesGames[`${channel.id}_${user.id}.typingStarted`] = startedTimestamp
    return
})