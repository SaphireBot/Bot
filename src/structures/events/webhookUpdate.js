import {
    SaphireClient as client,
    Database
} from "../../classes/index.js";

client.on("webhookUpdate", async channel => {

    const { guild } = channel

    // const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")
    const guildData = await Database.getGuild(guild.id)
    const isLogChannel = guildData?.LogSystem?.channel

    if (isLogChannel !== channel.id) return

    const webhookFetch = await channel.fetchWebhooks().catch(() => null)
    const webhook = webhookFetch?.find(w => w?.name === "Global System Notification")
    if (webhook) return

    await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $unset: { "LogSystem.webhookUrl": true } },
        { new: true }
    )
        .then(data => Database.saveCacheData(data.id, data))
    return;
})