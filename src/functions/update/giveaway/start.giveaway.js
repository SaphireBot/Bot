import { time, Guild, TextChannel } from 'discord.js'
import { SaphireClient as client, Database, GiveawayManager } from '../../../classes/index.js'
import { Emojis as e } from '../../../util/util.js'

/**
 * @param { Guild } guild
 * @param { TextChannel } channel
 */
export default async (gw, guild, channel, finalForce) => {

    const giveaway = [...GiveawayManager.giveaways, ...GiveawayManager.awaiting].find(g => g.MessageID == gw?.MessageID)

    if (!giveaway || !guild || !channel || !gw)
        return Database.deleteGiveaway(giveaway?.MessageID, guild?.id)

    const MessageID = giveaway.MessageID
    const message = await channel?.messages?.fetch(MessageID || '0').catch(() => null)

    if (!message) {
        channel.send({ content: `${e.cry} | O sorteio acabou mas a mensagem sumiu, como pode isso???` })
        return Database.deleteGiveaway(giveaway.MessageID, guild.id)
    }

    const WinnersAmount = giveaway.Winners || 1
    const Participantes = giveaway.Participants || []
    const Sponsor = giveaway.Sponsor
    const Prize = giveaway.Prize
    const MessageLink = giveaway.MessageLink
    const embedToEdit = message.embeds[0]?.data || { footer: { text: '' } }

    embedToEdit.color = client.red
    embedToEdit.description = null
    embedToEdit.title += ` | Sorteio ${finalForce ? 'Finalizado' : 'Encerrado'}`
    embedToEdit.footer.text = `Giveaway ID: ${MessageID} | ${Participantes.length} Participantes`
    embedToEdit.fields.push({
        name: `${e.Trash} Exclusão`,
        value: `${time(new Date(Date.now() + 172800000), "R")}`,
        inline: true
    })

    const components = message?.components[0]?.toJSON()
    if (components) {
        components.components[0].disabled = true
        components.components[1].disabled = !Participantes.length
    }
    message.edit({ embeds: [embedToEdit], components: components ? [components] : [] }).catch(() => { })

    if (!Participantes.length) {
        channel.send({
            embeds: [{
                color: client.red,
                title: `${e.Deny} | Sorteio cancelado`,
                description: `${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | ${MessageLink ? `[Giveaway Reference](${MessageLink})` : 'Link indisponível'}`
            }]
        }).catch(() => { })

        return Database.deleteGiveaway(MessageID, guild.id)
    }

    const vencedores = await GetWinners(Participantes, WinnersAmount, MessageID, guild.id)

    if (!vencedores || vencedores.length === 0) {
        channel.send({
            embeds: [{
                color: client.red,
                title: `${e.Deny} | Sorteio cancelado`,
                description: `${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | ${MessageLink ? `[Giveaway Reference](${MessageLink})` : 'Link indisponível'}`
            }]
        })
        return Database.deleteGiveaway(MessageID, guild.id)
    }

    const vencedoresMapped = []

    for await (let memberId of vencedores)
        vencedoresMapped.push(`${await GetMember(guild, memberId)}`)

    const sponsor = await guild.members.fetch(Sponsor)
        .then(member => member.user)
        .catch(() => `${e.Deny} Patrocinador não encontrado`)

    channel.send({
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
                ],
                footer: { text: 'Este sorteio será deletado do banco de dados em 48 horas' }
            }
        ]
    }).catch(() => Database.deleteGiveaway(MessageID, guild.id))

    const index = GiveawayManager.giveaways.findIndex(gw => gw.MessageID == MessageID)
    const dateNow = Date.now()
    GiveawayManager.giveaways[index].DischargeDate = dateNow
    await Database.Guild.updateOne(
        { id: guild.id, 'Giveaways.MessageID': MessageID },
        {
            $set: {
                'Giveaways.$.Participants': [...Participantes],
                'Giveaways.$.Actived': false,
                'Giveaways.$.DischargeDate': dateNow
            }
        }
    )

    return
}

async function GetWinners(WinnersArray, Amount = 1, MessageId, guildId) {

    if (!WinnersArray || !Amount || !WinnersArray.length) return []

    const Winners = WinnersArray.random(Amount)

    await Database.Guild.updateOne(
        { id: guildId, 'Giveaways.MessageID': MessageId },
        {
            $set: {
                'Giveaways.$.WinnersGiveaway': [...Winners],
                'Giveaways.$.Actived': false
            }
        }
    )

    return Winners
}

async function GetMember(guild, memberId) {
    const member = await guild.members.fetch(memberId).catch(() => null)
    return member ? `${member} *\`${member?.id || '0'}\`*` : `${e.Deny} Usuário não encontrado.`
}