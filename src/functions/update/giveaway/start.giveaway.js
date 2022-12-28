import {
    SaphireClient as client,
    Database
} from '../../../classes/index.js'
import { Emojis as e } from '../../../util/util.js'

export default async (giveaway, guild, channel) => {

    if (!giveaway || !guild || !channel)
        return Database.deleteGiveaway(giveaway.MessageID, guild.id)

    const { MessageID } = giveaway
    const emoji = giveaway.Emoji || '🎉'
    const message = await channel?.messages?.fetch(MessageID).catch(() => { })
    const reaction = message?.reactions?.cache?.get(emoji)

    if (!reaction || !message || !emoji)
    return Database.deleteGiveaway(giveaway.MessageID, guild.id)
    
    const reactionUsers = await reaction.users.fetch()
    const Data = Date.Timeout(giveaway.TimeMs, giveaway.DateNow)
    const WinnersAmount = giveaway.Winners || 1
    const Participantes = reactionUsers.filter(u => !u.bot).map(u => u.id) || []
    const Sponsor = giveaway.Sponsor
    const Prize = giveaway.Prize
    const MessageLink = giveaway.MessageLink

    if (!Data) {

        const embedToEdit = message.embeds[0]?.data || {}

        embedToEdit.color = client.red
        embedToEdit.description = null
        embedToEdit.title += ' | Sorteio encerrado'
        embedToEdit.footer.text = `Giveaway ID: ${MessageID} | ${Participantes.length} Participantes`
        message.edit({ embeds: [embedToEdit] }).catch(() => { })

        if (Participantes.length === 0) {
            channel.send({
                embeds: [
                    {
                        color: client.red,
                        title: `${e.Deny} | Sorteio cancelado`,
                        description: `${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | ${MessageLink ? `[Giveaway Reference](${MessageLink})` : 'Link indisponível'}`
                    }
                ]
            }).catch(() => { })

            return Database.deleteGiveaway(MessageID, guild.id)
        }

        const vencedores = await GetWinners(Participantes, WinnersAmount, MessageID, guild.id)

        if (!vencedores || vencedores.length === 0) {
            channel.send({
                embeds: [
                    {
                        color: client.red,
                        title: `${e.Deny} | Sorteio cancelado`,
                        description: `${e.Deny} | Sorteio cancelado por falta de participantes.\n🔗 | ${MessageLink ? `[Giveaway Reference](${MessageLink})` : 'Link indisponível'}`
                    }
                ]
            })
            return Database.deleteGiveaway(MessageID, guild.id)
        }

        const vencedoresMapped = []

        for await (let memberId of vencedores)
            vencedoresMapped.push(`${await GetMember(guild, memberId)}`)

        const sponsor = await guild.members.fetch(Sponsor)
            .then(member => member.user.tag)
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
                            name: `${e.CoroaDourada} Vencedores`,
                            value: `${vencedoresMapped.join('\n') || 'Ninguém'}`,
                            inline: true
                        },
                        {
                            name: `${e.ModShield} Patrocinador`,
                            value: sponsor,
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
                    footer: { text: 'Este sorteio será deletado em 24 horas' }
                }
            ]
        }).catch(() => Database.deleteGiveaway(MessageID, guild.id))

        await Database.Guild.updateOne(
            { id: guild.id, 'Giveaways.MessageID': MessageID },
            {
                $set: {
                    'Giveaways.$.Participants': [...Participantes],
                    'Giveaways.$.Actived': false
                }
            }
        )

        return
    }

    return
}

async function GetWinners(WinnersArray, Amount = 1, MessageId, guildId) {

    if (!WinnersArray || !Amount || !WinnersArray.length) return []

    const Winners = []

    WinnersArray.length > Amount
        ? (() => {

            for (let i = 0; i < Amount; i++)
                Winners.push(GetUserWinner())

        })()
        : Winners.push(...WinnersArray)

    await Database.Guild.updateOne(
        { id: guildId, 'Giveaways.MessageID': MessageId },
        {
            $set: {
                'Giveaways.$.WinnersGiveaway': [...Winners],
                'Giveaways.$.Actived': false
            }
        }
    )

    function GetUserWinner() {
        const Winner = WinnersArray.random()
        return Winners.includes(Winner) ? GetUserWinner() : Winner
    }

    return Winners
}

async function GetMember(guild, memberId) {
    const member = await guild.members.fetch(memberId).catch(() => null)

    return member
        ? `${member} *\`${member?.id || '0'}\`*`
        : `${e.Deny} Usuário não encontrado.`
}