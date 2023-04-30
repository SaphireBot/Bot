import { time, Guild, TextChannel } from 'discord.js'
import { SaphireClient as client, Database, GiveawayManager } from '../../../classes/index.js'
import { Emojis as e } from '../../../util/util.js'

/**
 * @param { Guild } guild
 * @param { TextChannel } channel
 */
export default async (gw, guild, channel, messageFetched) => {

    const giveaway = [
        ...GiveawayManager.giveaways,
        ...GiveawayManager.awaiting,
        ...GiveawayManager.toDelete
    ].find(g => g.MessageID == gw?.MessageID)

    if (!giveaway || !guild || !channel || !gw) return

    const MessageID = giveaway.MessageID
    let message = messageFetched || await channel.messages?.fetch(MessageID || '0').catch(() => null)

    if (!message) {
        channel.send({ content: `${e.Animated.SaphireCry} | O sorteio acabou mas a mensagem sumiu, como pode isso???` })
        return GiveawayManager.deleteGiveaway(giveaway)
    }

    if (giveaway.timeout)
        clearTimeout(giveaway.timeout)

    const WinnersAmount = giveaway.Winners || 1
    const Participantes = giveaway.Participants || []
    const Sponsor = giveaway.Sponsor
    const Prize = giveaway.Prize
    const MessageLink = giveaway.MessageLink
    const embedToEdit = message.embeds[0]?.data || {}
    const embedFields = embedToEdit.fields || []

    const embed = {
        color: client.red,
        title: `${e.Tada} Sorteios ${guild.name} | Sorteio Encerrado`,
        fields: [
            ...embedFields,
            {
                name: `${e.Trash} Exclusão`,
                value: time(new Date(Date.now() + 1000 * 60 * 60 * 24 * 20), "R"),
                inline: true
            }
        ],
        footer: {
            text: `Giveaway ID: ${MessageID}`
        }
    }

    const components = message?.components[0]?.toJSON()
    if (components) {
        components.components[0].disabled = true
        components.components[0].label = `Participar (${giveaway.Participants.length})`
        components.components[1].disabled = Participantes.length == 0
        message.edit({ embeds: [embed], components: components ? [components] : [] }).catch(() => { })
    }

    if (!Participantes.length) {

        embed.fields.push({
            name: '📝 Sorteio Cancelado',
            value: 'Nenhum usuário entrou neste sorteio',
            inline: true
        })

        channel.send({
            embeds: [{
                color: client.red,
                title: `${e.Deny} | Sorteio cancelado`,
                description: `${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | ${MessageLink ? `[Giveaway Reference](${MessageLink})` : 'Link indisponível'}`
            }]
        }).catch(() => { })

        return GiveawayManager.deleteGiveaway(giveaway)
    }

    const dateNow = Date.now()
    await guild.members.fetch()
    const guildMembers = guild.members.cache.map(member => member.id)
    const vencedores = Participantes.filter(id => guildMembers.includes(id)).random(WinnersAmount)
    const vencedoresMapped = vencedores.map(memberId => `<@${memberId}> \`${memberId}\``)
    const index = GiveawayManager.giveaways.findIndex(gw => gw.MessageID == MessageID)

    if (GiveawayManager.giveaways[index]) {
        GiveawayManager.giveaways[index].DischargeDate = dateNow
        GiveawayManager.giveaways[index].Actived = false
        GiveawayManager.giveaways[index].WinnersGiveaway = vencedores
    }
    delete GiveawayManager.retryCooldown[giveaway.MessageID]
    GiveawayManager.managerUnavailablesGiveaways([giveaway])

    const sponsor = guild.members.cache.get(Sponsor)?.user || `<@${Sponsor}>`

    const fields = [
        {
            name: `${e.ModShield} Patrocinador`,
            value: `${sponsor?.tag || `<@${Sponsor}>`} \`${Sponsor}\``,
            inline: true
        },
        {
            name: `${e.Star} Prêmio`,
            value: `${Prize}`,
            inline: true
        },
        {
            name: `${e.Reference} Giveaway Reference`,
            value: `${MessageLink ? `🔗 [Link do Sorteio](${MessageLink})` : 'Ok, a referência sumiu'}` + ` | 🆔 *\`${MessageID}\`*`
        }
    ]

    let description = null
    vencedoresMapped.length > 20
        ? description = `${vencedoresMapped.join('\n') || 'Ninguém'}`.limit('MessageEmbedDescription')
        : fields.unshift({
            name: `${e.CoroaDourada} Vencedores - ${vencedoresMapped.length}/${WinnersAmount}`,
            value: `${vencedoresMapped.join('\n') || 'Ninguém'}`,
            inline: true
        })

    const toMention = Array.from(new Set([Sponsor, ...vencedores]))
    return channel.send({
        content: `${e.Notification} | ${toMention.map(userId => `<@${userId}>`).join(', ').slice(0, 4000)}`.limit('MessageContent'),
        embeds: [{
            color: client.green,
            title: `${e.Tada} Sorteio Finalizado`,
            url: MessageLink || null,
            description,
            fields
        }]
    })
        .then(() => finish())
        .catch(() => GiveawayManager.deleteGiveaway(giveaway))

    async function finish() {

        await Database.Guild.updateOne(
            { id: guild.id, 'Giveaways.MessageID': MessageID },
            {
                $set: {
                    'Giveaways.$.Participants': Participantes,
                    'Giveaways.$.Actived': false,
                    'Giveaways.$.DischargeDate': dateNow,
                    'Giveaways.$.WinnersGiveaway': vencedores
                }
            }
        )

        message = await message.fetch().catch(() => null)
        const components = message?.components[0]?.toJSON()
        if (components) {
            components.components[0].disabled = true
            components.components[0].label = `Participar (${Participantes.length})`
        }

        return client.pushMessage({
            method: 'patch',
            channelId: channel.id,
            messageId: giveaway.MessageID,
            body: {
                components: components ? [components] : []
            }
        })
    }
}