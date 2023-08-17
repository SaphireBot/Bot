import { SaphireClient as client } from "../../../../classes/index.js"
import { ButtonStyle, parseEmoji } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, guildData, giveawayId) => {

    const { options, channel, guild } = interaction
    const messageId = giveawayId || options.getString('id')

    if (messageId === 'info')
        return interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e.Info} | Informações Gerais Do Sistema de Reroll`,
                fields: [
                    {
                        name: '💬 Em qual canal?',
                        value: 'O meu sistema foi projetado para efetuar rerolls em qualquer canal do Servidor.'
                    },
                    {
                        name: '✍ Escolha o sorteio',
                        value: 'Se o servidor tiver sorteios disponíveis para reroll, aparecerá automaticamente em uma lista automática na tag `id`.'
                    },
                    {
                        name: '👥 Vencedores',
                        value: 'Você pode escolher de 1 a 20 vencedores para um reroll.\nSe o número de vencedores não for informado, a quantidade de usuários sorteados será a mesma do sorteio original.'
                    },
                    {
                        name: '🔢 Quantos rerolls posso fazer?',
                        value: 'Meu sistema fornece rerolls infinitos para todos os servidores gratuitamentes.'
                    },
                    {
                        name: '🔑 Quais sorteios estão disponíveis para Reroll?',
                        value: '1. Sorteios já sorteados.\n2. Sorteios com mais de 1 participante'
                    }
                ]
            }]
        })

    const giveaway = guildData?.Giveaways?.find(gw => gw.MessageID === messageId)
    const winnersAmount = giveawayId ? giveaway?.Winners : options.getInteger('winners') || giveaway?.Winners

    if (!giveaway)
        return interaction.reply({
            content: `${e.Deny} | Sorteio não encontrado no banco de dados.`,
            ephemeral: true
        })

    if (giveaway.Actived)
        return interaction.reply({
            content: `${e.Deny} | Este sorteio ainda não foi finalizado.`,
            ephemeral: true
        })

    const winnersRandomized = giveaway.Participants?.sort(() => Math.random() - Math.random())?.slice(0, winnersAmount) || []

    if (!winnersRandomized || !winnersRandomized.length)
        return interaction.reply({ content: `${e.Deny} | Não foi possível obter nenhum vencedor.`, ephemeral: true })

    const Sponsor = giveaway.Sponsor
        ? await client.users.fetch(giveaway.Sponsor)
            .catch(() => null)
        : null

    const components = giveaway.MessageLink
        ? [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Sorteio Original',
                    emoji: '🔗',
                    url: giveaway.MessageLink,
                    style: ButtonStyle.Link
                },
                {
                    type: 2,
                    label: `${giveaway.Participants?.length || 0} ${giveaway.Participants?.length > 1 ? 'Participantes' : 'Participante'}`,
                    emoji: '👥',
                    customId: 'participants',
                    style: ButtonStyle.Primary,
                    disabled: true
                }
            ]
        }]
        : [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: `${giveaway.Participants?.length || 0} ${giveaway.Participants?.length > 1 ? 'Participantes' : 'Participante'}`,
                    emoji: '👥',
                    customId: 'participants',
                    style: ButtonStyle.Primary,
                    disabled: true
                }
            ]
        }]

    if (winnersRandomized.length >= 10) {

        const length = winnersRandomized.length
        const url = giveaway.MessageLink
        const toMentionMapped = winnersRandomized.map((userId, i) => `\`${format(i + 1, length)}\` - 🎉 <@${userId}> \`${userId}\``)

        const fields = [
            {
                name: `${e.Reference} Sorteio`,
                value: `🔗 [Link do Sorteio](${url})` + `\n🆔 *\`${giveaway.MessageID}\`*`,
                inline: true
            },
            {
                name: `${e.Star} Prêmio`,
                value: `${giveaway.Prize}`,
                inline: true
            }
        ]

        if (Sponsor?.id)
            fields.unshift({
                name: `${e.ModShield} Patrocinador`,
                value: `${Sponsor?.username}\n\`${Sponsor?.id}\``,
                inline: true
            })

        for (let i = 0; i < length; i += 10) {
            const content = toMentionMapped.slice(i, i + 10).join('\n')
            client.pushMessage({
                channelId: channel.id,
                method: 'post',
                body: {
                    channelId: channel.id,
                    method: 'post',
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
                    url,
                    fields,
                    footer: {
                        text: `${length}/${winnersAmount} participantes sorteados`
                    }
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: 'Dados deste sorteio',
                        emoji: parseEmoji(e.Commands),
                        custom_id: JSON.stringify({ c: 'giveaway', src: 'list', gwId: giveaway.MessageID }),
                        style: ButtonStyle.Primary
                    }]
                }]
            }
        })
        return
    }

    const embed = {
        color: client.green,
        title: `${e.Tada} Sorteio Finalizado [REROLL]`,
        url: giveaway?.MessageLink || null,
        fields: [
            {
                name: `${e.CoroaDourada} Vencedores`,
                value: `${winnersRandomized.map(id => `<@${id}> - \`${id}\``).join('\n') || 'Ninguém'}`.limit('MessageEmbedFieldValue'),
                inline: true
            },
            {
                name: `${e.Star} Prêmio`,
                value: `${giveaway.Prize}`,
                inline: true
            }
        ],
        footer: { text: `Giveaway ID: ${giveaway.MessageID}` }
    }

    if (Sponsor)
        embed.fields.splice(1, 0, {
            name: `${e.ModShield} Patrocinador`,
            value: `${Sponsor?.username} - \`${giveaway.Sponsor || 0}\``,
            inline: true
        })

    return interaction.reply({
        content: `${e.Notification} | ${winnersRandomized.map(id => `<@${id}>`).join(', ')}`.limit('MessageContent'),
        embeds: [embed],
        components
    })

}

function format(num, originalNumber) {
    if (originalNumber >= 100) {
        if (num < 10) return `00${num}`
        if (num >= 10 && num < 100) return `0${num}`
        return `${num}`
    }

    if (num < 10) return `0${num}`
    return `${num}`
}