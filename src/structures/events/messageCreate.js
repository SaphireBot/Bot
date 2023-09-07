import { SaphireClient as client, Experience, Database, AfkManager, ChestManager, SpamManager } from '../../classes/index.js';
import { DiscordPermissons } from '../../util/Constants.js';
import { ChannelType } from 'discord.js';
import { Emojis as e } from '../../util/util.js';
import { socket } from '../../websocket/websocket.js';
import registerSlashCommandsRequest from './functions/registerSlashCommands.js';

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

    Experience.add(message.author.id, 1)
    ChestManager.add(message.guildId, message.channelId)
    AfkManager.check(message)
    SpamManager.check(message)

    if (!message.content?.length) return

    if (
        [`<@&${message.guild.members.me?.roles?.botRole?.id}>`, `<@${client.user.id}>`].includes(message.content)
    ) {
        return message.reply({
            embeds: [{
                color: client.blue,
                title: `${e.Animated.SaphireReading} ${message.guild.name}'s Prefixes`,
                description: `${e.saphirePolicial} | Opa, tudo bem? Meus comandos estão 100% em /slashCommand e alguns estão sendo criados em prefixos.` + '\n \n' + Database.getPrefix(message.guildId).map((pr, i) => `${i + 1}. **${pr}**`).join('\n'),
                fields: [
                    {
                        name: `${e.Info} Limites`,
                        value: "Cada servidor tem direito a 5 prefixos customizados."
                    }
                ]
            }],
        }).then(msg => setTimeout(() => msg.delete()?.catch(() => { }), 10000)).catch(() => { })
    }

    const availablePrefix = Database.getPrefix(message.guildId)
    availablePrefix.unshift(`<@${client.user.id}>`, `<@&${message.guild.members.me?.roles?.botRole?.id}>`)

    // Regex by deus do Regex: Gorniaky 395669252121821227 
    const prefixRegex = RegExp(`^(${(availablePrefix).join('|').replace(/[\\]?([.+~*?!^$(){}[\]])/g, "\\$1")})\\s*([\\w\\W]+)`)
    const prefix = message.content.match(prefixRegex)
    if (!prefix) return

    /**
     * prefix[0] = All Content
     * prefix[1] = prefix
     * prefix[2] = All content without prefix
     * prefix.index | prefix.input | prefix.groups = Just ignore
     */
    const args = prefix[2].trim().split(/ +/g)
    const cmd = args.shift().toLowerCase()
    if (!cmd?.length) return

    const command = client.prefixCommands.get(cmd)
    if (command) return command.execute(message, args)
        .catch(err => {
            console.log(err)
            return message.channel.send({ content: `${e.Animated.SaphirePanic} | Deu um erro aqui...\n${e.bug} | \`${err}\`` }).catch(() => { })
        })
    return
})
