import { ButtonStyle, ButtonInteraction, ChannelType, parseEmoji } from "discord.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { replacePlaceholder } from "../../../../functions/plugins/plugins.js"
import embed from "./embed.server.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { 
 *      { channelId: String, body: { content: String | null, embeds: Array } }
 *      | { channelId: String, content: String | null, embeds: Array }
 *  } bodyCustom
 * @param { 'welcome' | 'leave' } type
 */
export default async (interaction, bodyCustom, type) => {

    const { message, channel, user, member } = interaction

    const body = {
        content: bodyCustom?.body?.content || bodyCustom?.content || null,
        channelId: bodyCustom?.channelId || null,
        embeds: bodyCustom?.body?.embeds || bodyCustom?.embeds || []
    }

    const components = [
        {
            type: 1,
            components: [{
                type: 8,
                custom_id: 'menu',
                placeholder: 'Escolher Canal de Notificação',
                min_values: 0,
                max_values: 1,
                channel_types: [
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                ]
            }]
        },
        {
            type: 1,
            components: [
                {
                    type: 2,
                    label: !body.channelId ? 'Escolha um canal para continuar' : 'Continuar',
                    emoji: parseEmoji(e.saphireRight),
                    custom_id: 'embed',
                    style: ButtonStyle.Success,
                    disabled: !body.channelId
                },
                {
                    type: 2,
                    label: 'Cancelar Configuração',
                    emoji: parseEmoji(e.Trash),
                    custom_id: 'cancel',
                    style: ButtonStyle.Danger
                }
            ]
        }
    ]

    await interaction.update({
        content: `${e.Loading} | Ok, qual é a mensagem que você quer que eu diga?\n${e.Info} | Lembre-se que a mensagem que você escrever será mostrada fora da embed.`,
        embeds: [{
            color: client.blue,
            title: '📝 Mensagem Fora da Embed',
            description: replacePlaceholder(body.content, member) || 'Nenhuma mensagem definida',
            fields: [
                {
                    name: '✍️ Limites',
                    value: `O limite permitido para o conteúdo da mensagem é de **1000 caracteres**.\nA configuração será encerrada ${Date.Timestamp(1000 * 60 * 2, 'R')}.`
                },
                {
                    name: `${e.Info} Placeholders`,
                    value: '**$member** para mencionar o membro\n**$memberTag** para menciar a tag#0000 do membro\n**$memberId** para mencionar o ID do usuário\n**$server** para mencionar o servidor'
                },
                {
                    name: '💬 Canal de Notificação',
                    value: body.channelId ? `<#${body.channelId}> \`${body.channelId}\`` : 'Nenhum canal escolhido.'
                }
            ]
        }],
        components
    }).catch(() => { })

    const messageCollector = channel.createMessageCollector({
        filter: msg => msg.author.id == user.id && msg.content?.length,
        idle: 1000 * 60 * 2
    })
        .on('collect', message => {
            const replacedLength = replacePlaceholder(message.content, member)?.length

            if (replacedLength > 1000)
                return message.reply({
                    content: `${e.Deny} | Essa mensagem somado com os placeholders, somam mais de ${replacedLength}/1000 caracteres.`
                })

            body.content = message.content.slice(0, 1000)
            return updateMessage()
        })
        .on('end', (_, reason) => {

            if (['idle', 'time', 'limit'].includes(reason)) {

                client.pushMessage({
                    channelId: channel.id,
                    method: 'delete',
                    messageId: message.id
                })

                client.pushMessage({
                    channelId: channel.id,
                    method: 'post',
                    body: {
                        content: `${e.DenyX} | Tempo de espera chegou ao limite. Configuração encerrada.`,
                    }
                })
            }

            return
        })

    const componentCollector = message.createMessageComponentCollector({
        filter: int => int.user.id == user.id
    })
        .on('collect', int => {

            const { customId } = int

            if (customId == 'menu') {
                body.channelId = int.values[0]
                return updateMessage(int)
            }

            if (customId == 'cancel') {
                messageCollector.stop()
                componentCollector.stop()
                return
            }

            if (customId == 'embed') {
                messageCollector.stop()
                body.embedConfigEnabled = true
                componentCollector.stop()
                return embed(int, body, type)
            }

            return;
        })
        .on('end', (_, reason) => {

            if (reason == 'messageDelete')
                return client.pushMessage({
                    channelId: channel.id,
                    method: 'post',
                    body: {
                        content: `${e.SaphireDesespero} | Haaaa, apagaram a mensagem. Poooxa. A configuração de mensagem de boas-vindas foi cancelada, ok?`
                    }
                })

            if (reason == 'user' & !body.embedConfigEnabled)
                interaction.editReply({
                    content: `${e.sleep} | Beleza, configuração encerrada.`,
                    embeds: [], components: []
                }).catch(() => { })

            delete body.embedConfigEnabled
            return;
        })

    async function updateMessage(int) {
        components[1].components[0].disabled = !body.channelId
        components[1].components[0].label = !body.channelId ? 'Escolha um canal para continuar' : 'Continuar'

        const replaced = replacePlaceholder(body.content, member)

        const data = {
            content: `${e.QuestionMark} | Ok, qual é a mensagem que você quer que eu diga?\n${e.Info} | Lembre-se que a mensagem que você escrever será mostrada fora da embed.`,
            embeds: [{
                color: client.blue,
                title: '📝 Mensagem Fora da Embed',
                description: replaced || 'Nenhuma mensagem definida',
                fields: [
                    {
                        name: '✍️ Limites',
                        value: `O limite permitido para o conteúdo da mensagem é de **1000 caracteres**.\nA configuração será encerrada ${Date.Timestamp(1000 * 60 * 2, 'R')}.`
                    },
                    {
                        name: `${e.Info} Placeholders`,
                        value: '**$member** para mencionar o membro\n**$memberTag** para menciar a tag#0000 do membro\n**$memberId** para mencionar o ID do usuário\n**$server** para mencionar o nome do servidor'
                    },
                    {
                        name: '💬 Canal de Notificação',
                        value: body.channelId ? `<#${body.channelId}> \`${body.channelId}\`` : 'Nenhum canal escolhido.'
                    }
                ]
            }],
            components
        }

        return int
            ? int.update(data).catch(() => { })
            : client.pushMessage({
                channelId: channel.id,
                method: 'patch',
                messageId: message.id,
                body: data
            })
    }

    return
}