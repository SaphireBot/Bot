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
    let message = messageFetched || await channel?.messages?.fetch(MessageID || '0').catch(() => null)

    if (!message) {
        channel.send({ content: `${e.cry} | O sorteio acabou mas a mensagem sumiu, como pode isso???` })
        return GiveawayManager.deleteGiveaway(giveaway)
    }

    if (giveaway.timeout)
        clearTimeout(giveaway.timeout)

    const WinnersAmount = giveaway.Winners || 1
    const Participantes = giveaway.Participants || []
    const Sponsor = giveaway.Sponsor
    const Prize = giveaway.Prize
    const MessageLink = giveaway.MessageLink
    const embedToEdit = message.embeds[0]?.data || { footer: { text: '' } }
    const fields = embedToEdit.fields || []

    const embed = {
        color: client.red,
        title: `${e.Tada} Sorteios ${guild.name} | Sorteio Encerrado`,
        fields: [
            ...fields,
            {
                name: `${e.Trash} Exclusão`,
                value: time(new Date(Date.now() + 1000 * 60 * 60 * 24 * 20), "R"),
                inline: true
            }
        ],
        footer: {
            text: `Giveaway ID: ${MessageID} | ${Participantes.length} Participantes`
        }
    }

    const components = message?.components[0]?.toJSON()
    if (components) {
        components.components[0].disabled = true
        components.components[0].label = `Participar (${giveaway.Participants.length})`
    }

    message.edit({ embeds: [embed], components: components ? [components] : [] }).catch(() => { })

    if (!Participantes.length) {

        const embed = message?.embeds[0]

        if (embed) {
            embed.fields.push({
                name: '📝 Sorteio Cancelado',
                value: 'Nenhum usuário entrou neste sorteio',
                inline: true
            })
            message.edit({ embeds: [embed] }).catch(() => { })
        }

        channel.send({
            embeds: [{
                color: client.red,
                title: `${e.Deny} | Sorteio cancelado`,
                description: `${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | ${MessageLink ? `[Giveaway Reference](${MessageLink})` : 'Link indisponível'}`
            }]
        }).catch(() => { })

        return GiveawayManager.deleteGiveaway(giveaway)
    }

    const index = GiveawayManager.giveaways.findIndex(gw => gw.MessageID == MessageID)
    const dateNow = Date.now()
    GiveawayManager.giveaways[index].DischargeDate = dateNow
    GiveawayManager.giveaways[index].Actived = true
    delete GiveawayManager.retryCooldown[giveaway.MessageID]
    GiveawayManager.managerUnavailablesGiveaways([giveaway])
    const vencedores = Participantes.random(WinnersAmount)
    const vencedoresMapped = vencedores.map(memberId => `<@${memberId}> \`${memberId}\``)

    const sponsor = await guild.members.fetch(Sponsor)
        .then(member => member.user)
        .catch(() => `<@${Sponsor}>`)

    return channel.send({
        content: `${e.Notification} | ${[sponsor, ...vencedoresMapped].join(', ').slice(0, 4000)}`,
        embeds: [
            {
                color: client.green,
                title: `${e.Tada} Sorteio Finalizado`,
                url: MessageLink || null,
                fields: [
                    {
                        name: `${e.CoroaDourada} Vencedores - ${vencedoresMapped.length}/${WinnersAmount}`,
                        value: `${vencedoresMapped.join('\n') || 'Ninguém'}`,
                        inline: true
                    },
                    {
                        name: `${e.ModShield} Patrocinador`,
                        value: sponsor?.tag || `${e.Deny} Patrocinador não encontrado`,
                        inline: true
                    },
                    {
                        name: `${e.Star} Prêmio`,
                        value: `${Prize}`,
                        inline: true
                    },
                    {
                        name: `${e.Reference} Giveaway Reference`,
                        value: `🔗 [Link do Sorteio](${MessageLink}) | 🆔 *\`${MessageID}\`*`
                    }
                ]
            }
        ]
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
        return setTimeout(() => message?.edit({ components: components ? [components] : [] }).catch(() => { }), 1000)
    }
}