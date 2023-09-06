import { SaphireClient as client, Experience, Database, AfkManager, ChestManager, SpamManager } from '../../classes/index.js';
import { DiscordPermissons } from '../../util/Constants.js';
import { ChannelType } from 'discord.js';
import { Emojis as e } from '../../util/util.js';
import { socket } from '../../websocket/websocket.js';
import registerSlashCommandsRequest from './functions/registerSlashCommands.js';
export const prefixes = new Map()

client.on('messageCreate', async message => {
    client.messages++
    if (socket?.connected) socket?.send({ type: "addMessage" })

    if (
        !message
        || !message.id
        || !message.guild
        || !message.channel
        || message.webhookId
        || message.system
        || message.author?.bot
        || message.type == ChannelType.DM
    ) return

    if (client.admins.includes(message.author.id)) {
        if (message.content == `<@${client.user.id}> register global slash commands`) return registerSlashCommandsRequest(message, "global")
        if (message.content.includes(`<@${client.user.id}> delete global slash commands`)) return registerSlashCommandsRequest(message, "delete_global", message.content.split(" ")[5])
        if (message.content.includes(`<@${client.user.id}> register global slash commands`)) return registerSlashCommandsRequest(message, "register_global", message.content.split(" ")[5])
        if (message.content.includes(`<@${client.user.id}> register guild slash commands`)) return registerSlashCommandsRequest(message, "register_guild", message.content.split(" ")[5])
        if (message.content.includes(`<@${client.user.id}> delete guild slash commands`)) return registerSlashCommandsRequest(message, "delete_guild", message.content.split(" ")[5])
        if (message.content == `<@${client.user.id}> register admin slash commands`) return registerSlashCommandsRequest(message, "put", message.content.split(" ")[5])
        if (message.content == `<@${client.user.id}> delete admin slash commands`) return registerSlashCommandsRequest(message, "delete", message.content.split(" ")[5])
        if (message.content == `<@${client.user.id}> register linked roles`) return client.linkedRolesLoad(message)
    }

    // Ideia original dada por André - 648389538703736833
    if (message.channel.type === ChannelType.GuildAnnouncement) {
        const guildData = await Database.getGuild(message.guildId)
        const isChannelCrosspostable = guildData?.announce?.crosspost

        if (isChannelCrosspostable && message.guild.members.me.permissions.has(DiscordPermissons.Administrator))
            await message.crosspost().then(() => message.react('📨')).catch(() => { })
    }

    if (!message.guild || message.webhookId) return
    Experience.add(message.author.id, 1)
    ChestManager.add(message.guildId, message.channelId)
    AfkManager.check(message)
    SpamManager.check(message)

    if (message.content === `<@${client.user.id}>`) {
        const helpCommandId = client.application.commands.cache.find(c => c.name === "help")?.id;
        return message.reply({ content: `${e.saphirePolicial} | Opa, tudo bem? Meus comandos estão 100% em /slashCommand. Veja alguns deles usando ${helpCommandId ? `</help:${helpCommandId}>` : "`/help`"}` }).catch(() => { })
    }

    if (!message.content?.length) return

    for (const prefix of prefixes.get(message.guild.id) || ['s!', '-'])
        if (message.content.startsWith(prefix))
            return valideMessageCommand(prefix)

    /**
     * @param { string } prefix 
     */
    function valideMessageCommand(prefix) {
        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        const cmd = args.shift().toLowerCase()

        if (!cmd?.length) return

        const command = client.prefixCommands.get(cmd)
        if (command) return command.execute(message, args)
            .catch(console.log)

        return
        return message.reply({ content: `${e.Animated.SaphireReading} | Não tenho nenhum comando com este nome.` })
            .then(msg => setTimeout(() => msg.delete().catch(() => { }), 4000))
    }

    return
})
