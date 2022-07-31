import { SaphireClient as client, Database } from '../../classes/index.js'
import { Config as config } from '../../util/Constants.js'
import Notify from '../../functions/plugins/notify.js'

client.on('channelDelete', async channel => {

    if (!channel || !channel.guild) return

    const user = await client.getUser(channel.topic)
    const proofGuild = await client.getGuild(channel.guild.id)
    const userData = user ? await Database.User.findOne({ id: channel.topic }, 'PrivateChannel') : null
    const inGuildChannel = proofGuild ? proofGuild?.channels?.cache?.find(ch => ch.topic === channel.topic) : null

    if (user && inGuildChannel)
        await Database.User.updateOne(
            { id: channel.topic },
            { $unset: { 'Cache.ComprovanteOpen': 1 } }
        )

    if (userData?.PrivateChannel === channel.topic)
        await Database.User.updateOne(
            { id: channel.topic },
            { $unset: { PrivateChannel: 1 } }
        )

    if (channel.id === config.LoteriaChannel)
        return Notify(config.guildId, 'Recurso Desabilitado', `O canal **${channel.name}** configurado como **Lotery Result At Principal Server** foi deletado.`)

    const guild = await Database.Guild.findOne({ id: channel.guild.id })
    if (!guild) return

    switch (channel.id) {
        case guild['IdeiaChannel']: DeletedChannel('IdeiaChannel', 'Canal de Ideias/Sugestões'); break;
        case guild['LeaveChannel.Canal']: DeletedChannel('LeaveChannel', 'Canal de Saída'); break;
        case guild['XPChannel']: DeletedChannel('XPChannel', 'Canal de Level Up'); break;
        case guild['ReportChannel']: DeletedChannel('ReportChannel', 'Canal de Reportes'); break;
        case guild['LogChannel']: (async () => await Database.Guild.updateOne({ id: channel.guild.id }, { $unset: { LogChannel: 1 } }))(); break;
        case guild['WelcomeChannel.Canal']: DeletedChannel('WelcomeChannel', 'Canal de Boas-Vindas'); break;
        case guild[`Blockchannels.Bots.${channel.id}`]: DeletedChannel(`Blockchannels.Bots.${channel.id}`, 'Bloqueio de Comandos'); break;
        case guild[`Blockchannels.${channel.id}`]: DeletedChannel(`Blockchannels.${channel.id}`, 'Bloqueio de Comandos'); break;
        case guild['ConfessChannel']: DeletedChannel('ConfessChannel', 'Canal de Confissão'); break;
        case guild['GiveawayChannel']: Database.deleteGiveaway('', channel.guild.id, true); DeletedChannel('GiveawayChannel', 'Canal de Sorteios'); break;
        default: break;
    }

    async function DeletedChannel(ChannelDB, CanalFunction) {

        await Database.Guild.updateOne(
            { id: channel.guild.id },
            { $unset: { [ChannelDB]: 1 } }
        )

        return Notify(channel.guild.id, 'Recurso Desabilitado', `O canal **${channel.name}** configurado como **${CanalFunction}** foi deletado.`)
    }
})