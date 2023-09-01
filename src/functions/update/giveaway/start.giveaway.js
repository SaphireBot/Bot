import { SaphireClient as client, Database, GiveawayManager } from '../../../classes/index.js';
import { time, Guild, TextChannel, ButtonStyle, parseEmoji } from 'discord.js';
import { setTimeout as sleep } from "node:timers/promises";
import { Emojis as e } from '../../../util/util.js';

/**
 * @param { Guild } guild
 * @param { TextChannel } channel
 */
export default async (gw, guild, channel, messageFetched) => {

    const giveaway = GiveawayManager.getGiveaway(gw?.MessageID)

    if (!giveaway || !guild || !channel) return
    delete GiveawayManager.retryCooldown[giveaway.MessageID]

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
    const RolesToAdd = giveaway.AddRoles || []
    const SponsorId = giveaway.Sponsor
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
            text: embedToEdit?.footer?.text || null
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
                title: `${e.Deny} Sorteio cancelado`,
                description: `${e.Deny} Sorteio cancelado por falta de participantes.\n🔗 ${MessageLink ? `[Giveaway Reference](${MessageLink})` : 'Link indisponível'}`
            }]
        }).catch(() => { })

        return GiveawayManager.deleteGiveaway(giveaway)
    }

    const dateNow = Date.now()
    await guild.members.fetch()
    let winners = guild.members.cache.filter(m => Participantes.includes(m.id) && !m.user.bot)

    if (giveaway.AllowedRoles?.length)
        winners = giveaway.RequiredAllRoles
            ? winners.filter(member => {
                if (giveaway.AllowedMembers?.includes(member.id)) return true
                return member.roles.cache.hasAll(...giveaway.AllowedRoles)
            })
            : winners.filter(member => {
                if (giveaway.AllowedMembers?.includes(member.id)) return true
                return member.roles.cache.hasAny(...giveaway.AllowedRoles)
            })

    if (giveaway.LockedRoles?.length)
        winners = winners.filter(member => member.roles.cache.hasAny(...giveaway.LockedRoles))

    let allowedParticipants = Array.from(winners.keys())

    if (giveaway.MultipleJoinsRoles?.length)
        for (const role of giveaway.MultipleJoinsRoles)
            winners.forEach(user => {
                if (user.roles.cache.has(role?.id))
                    for (let i = 0; i < role.joins; i++)
                        allowedParticipants.push(user.id)
            })

    winners = []

    for (let i = 0; i < WinnersAmount; i++) {
        if (!allowedParticipants.length) break;
        winners.push(allowedParticipants.random())
        allowedParticipants = allowedParticipants.filter(id => !winners.includes(id))
    }

    if (RolesToAdd.length)
        for (const winnerId of winners)
            guild.members.cache.get(winnerId)?.roles?.add(RolesToAdd)?.catch(() => { })

    if (GiveawayManager.giveaways[giveaway.MessageID]) {
        GiveawayManager.giveaways[giveaway.MessageID].DischargeDate = dateNow
        GiveawayManager.giveaways[giveaway.MessageID].Actived = false
        GiveawayManager.giveaways[giveaway.MessageID].WinnersGiveaway = winners
    }
    GiveawayManager.managerUnavailablesGiveaways([giveaway])

    const sponsor = guild.members.cache.get(SponsorId)?.user || null

    const fields = [
        {
            name: `${e.Reference} Sorteio`,
            value: `${MessageLink ? `🔗 [Link do Sorteio](${MessageLink})` : 'Ok, a referência sumiu'}` + `\n🆔 *\`${MessageID}\`*`,
            inline: true
        },
        {
            name: `${e.Star} Prêmio`,
            value: `${Prize}`,
            inline: true
        }
    ]

    if (sponsor)
        fields.unshift({
            name: `${e.ModShield} Patrocinador`,
            value: `${sponsor?.username}\n\`${SponsorId}\``,
            inline: true
        })

    const toMention = Array.from(new Set(winners))

    if (toMention.length >= 10) {

        const toMentionMapped = toMention.map(userId => `🎉 <@${userId}> \`${userId}\``)

        const dataToPush = []

        for (let i = 0; i < toMention.length; i += 10) {
            const content = toMentionMapped.slice(i, i + 10).join('\n')
            dataToPush.push({
                channelId: channel.id,
                method: 'post',
                body: {
                    method: 'post',
                    channelId: channel.id,
                    content,
                    message_reference: {
                        channel_id: channel.id,
                        message_id: giveaway.MessageID,
                        fail_if_not_exists: false,
                        guild_id: guild.id
                    }
                }
            })
            continue
        }

        for (const data of dataToPush) client.pushMessage(data)
        await sleep(1000)
        client.pushMessage({
            channelId: channel.id,
            method: 'post',
            body: {
                channelId: channel.id,
                method: 'post',
                content: giveaway.CreatedBy ? `${e.Notification} <@${giveaway.CreatedBy}>` : giveaway.Sponsor ? `<@${giveaway.Sponsor}>` : null,
                embeds: [{
                    color: client.green,
                    title: `${e.Tada} Sorteio Finalizado`,
                    url: MessageLink || null,
                    fields,
                    footer: {
                        text: `${toMention.length}/${WinnersAmount} participantes sorteados`
                    }
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: 'Dados deste sorteio',
                        emoji: parseEmoji(e.Animated.SaphireReading),
                        custom_id: JSON.stringify({ c: 'giveaway', src: 'list', gwId: MessageID }),
                        style: ButtonStyle.Primary
                    }]
                }]
            }
        })

        if (RolesToAdd.length)
            client.pushMessage({
                content: `${e.Animated.SaphireDance} | Os vencedores deste sorteio ganharam ${RolesToAdd.length} cargo${RolesToAdd.length == 1 ? '' : 's'}. Parabéns!`,
                embeds: [
                    {
                        color: client.green,
                        description: RolesToAdd.map(roleId => `<@&${roleId}>`).join(', ').limit('MessageEmbedDescription'),
                        footer: {
                            text: `Todos os cargos foram adicionados ao vencedores automaticamente.\nSe o cargo não foi adicionado, eu posso não ter as permissões necessárias.`
                        }
                    }
                ]
            }).catch(() => { })

        return finish()
    }

    if (!winners.length && Participantes.length)
        fields.push({
            name: `${e.Gear} System`,
            value: "Nenhum dos participantes cumprem os requisitos do sorteio."
        })

    channel.send({
        content: `${e.Notification} | ${[giveaway?.CreatedBy || SponsorId, ...toMention].filter(i => i).map(id => `<@${id}>`).join(', ')}`.limit('MessageContent'),
        embeds: [{
            color: client.green,
            title: `${e.Tada} Sorteio Finalizado`,
            url: MessageLink || null,
            fields,
            footer: {
                text: `${winners.length || 0}/${WinnersAmount} participantes sorteados`
            }
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Dados deste sorteio',
                    emoji: parseEmoji(e.Animated.SaphireReading),
                    custom_id: JSON.stringify({ c: 'giveaway', src: 'list', gwId: MessageID }),
                    style: ButtonStyle.Primary
                }
            ]
        }]
    })
        .then(() => finish())
        .catch(() => GiveawayManager.deleteGiveaway(giveaway))

    if (RolesToAdd.length)
        return channel.send({
            content: `${e.Animated.SaphireDance} | Os vencedores deste sorteio ganharam ${RolesToAdd.length} cargo${RolesToAdd.length == 1 ? '' : 's'}. Parabéns!`,
            embeds: [
                {
                    color: client.green,
                    description: RolesToAdd.map(roleId => `<@&${roleId}>`).join(', ').limit('MessageEmbedDescription'),
                    footer: {
                        text: `Todos os cargos foram adicionados ao vencedores automaticamente.\nSe o cargo não foi adicionado, eu posso não ter as permissões necessárias.`
                    }
                }
            ]
        }).catch(() => { })

    return

    async function finish() {

        await Database.Guild.findOneAndUpdate(
            { id: guild.id, 'Giveaways.MessageID': MessageID },
            {
                $set: {
                    'Giveaways.$.Participants': Participantes,
                    'Giveaways.$.Actived': false,
                    'Giveaways.$.DischargeDate': dateNow,
                    'Giveaways.$.WinnersGiveaway': winners
                }
            },
            { new: true }
        )
            .then(data => Database.saveGuildCache(data.id, data))

        message = await message.fetch().catch(() => null)
        if (!message) return

        const components = message?.components[0]?.toJSON()
        const body = { components: [], embeds: [message?.embeds[0]].filter(i => i) }

        if (components) {
            components.components[0].disabled = true
            components.components[0].label = `Participar (${Participantes.length})`
            body.components.push(components)
        }

        return message?.edit({ ...body }).catch(() => { })
    }
}