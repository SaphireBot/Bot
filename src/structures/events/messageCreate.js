import { ChannelType } from 'discord.js';
import { SaphireClient as client, Experience, Database, AfkManager, ChestManager, SpamManager } from '../../classes/index.js'
import { DiscordPermissons } from '../../util/Constants.js';
import { Emojis as e } from '../../util/util.js'

client.on('messageCreate', async message => {
    client.messages++

    if (!message || !message.id || message.channel)

        // Ideia original dada por André - 648389538703736833
        if (message.channel.type === ChannelType.GuildAnnouncement) {
            // const guildData = await Database.Guild.findOne({ id: message.guildId }, 'announce.crosspost')
            const guildData = await Database.getGuild(message.guildId)
            const isChannelCrosspostable = guildData?.announce?.crosspost

            if (isChannelCrosspostable && message.guild.members.me.permissions.has(DiscordPermissons.Administrator))
                await message.crosspost().then(() => message.react('📨')).catch(() => { })
        }

    if (message?.author?.bot || !message.guild || message.webhookId) return
    Experience.add(message.author.id, 1)
    ChestManager.add(message.guildId, message.channelId)
    AfkManager.check(message)
    SpamManager.check(message)

    if (message.content === `<@${client.user.id}>`)
        return message.reply({ content: `${e.saphirePolicial} | Opa, tudo bem? Meus comandos estão 100% em /slashCommand. Veja alguns deles usando \`/help\`` }).catch(() => { })

    return
})