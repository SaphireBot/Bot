import { SaphireClient as client, Database } from '../../classes/index.js'
import { Config as config } from '../../util/Constants.js'
import Notify from '../../functions/plugins/notify.js'

client.on('channelDelete', async channel => {

    if (!channel || !channel.guild) return

    if (channel.id === config.LoteriaChannel)
        return Notify(config.guildId, 'Recurso Desabilitado', `O canal **${channel.name}** configurado como **Lotery Result At Principal Server** foi deletado.`)

    const guildData = await Database.Guild.findOne({ id: channel.guild.id })
    if (!guildData) return

    switch (channel.id) {
        case guildData['IdeiaChannel']: DeletedChannel('IdeiaChannel', 'Canal de Ideias/Sugestões'); break;
        case guildData['LeaveChannel.Canal']: DeletedChannel('LeaveChannel', 'Canal de Saída'); break;
        case guildData['XPChannel']: DeletedChannel('XPChannel', 'Canal de Level Up'); break;
        case guildData['ReportChannel']: DeletedChannel('ReportChannel', 'Canal de Reportes'); break;
        case guildData['LogChannel']: (async () => await Database.Guild.updateOne({ id: channel.guild.id }, { $unset: { LogChannel: 1 } }))(); break;
        case guildData['WelcomeChannel.Canal']: DeletedChannel('WelcomeChannel', 'Canal de Boas-Vindas'); break;
        case guildData[`Blockchannels.Bots.${channel.id}`]: DeletedChannel(`Blockchannels.Bots.${channel.id}`, 'Bloqueio de Comandos'); break;
        case guildData[`Blockchannels.${channel.id}`]: DeletedChannel(`Blockchannels.${channel.id}`, 'Bloqueio de Comandos'); break;
        case guildData['ConfessChannel']: DeletedChannel('ConfessChannel', 'Canal de Confissão'); break;
        case guildData['GiveawayChannel']: Database.deleteGiveaway('', channel.guild.id, true); DeletedChannel('GiveawayChannel', 'Canal de Sorteios'); break;
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