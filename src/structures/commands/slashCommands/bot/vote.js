import { Config } from '../../../../util/Constants.js'
import axios from 'axios'

export default {
    name: 'vote',
    description: '[bot] Vote no Top.gg e ganhe uma recompensa',
    category: "bot",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'reminder',
            description: 'Ative um lembrete automático para o próximo voto',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'Ativar lembrete automático',
                    value: 'reminder'
                },
                {
                    name: 'Não quero nenhum lembrete',
                    value: 'noreminder'
                }
            ]
        }
    ],
    async execute({ interaction, client, Database, e }) {

        const { options, user, channel, guild } = interaction
        const hasVoted = await axios.get(
            `https://top.gg/api/bots/${client.user.id}/check?userId=${user.id}`,
            { headers: { authorization: process.env.TOP_GG_TOKEN } }
        )
            .then(res => res?.data?.voted === 1)
            .catch(() => 2)

        if (hasVoted === 2)
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível verificar o estado de votação. Por favor, tente daqui a pouco.`,
                ephemeral: true
            })

        if (hasVoted)
            return await interaction.reply({
                content: `${e.Deny} | Você já votou nas últimas 12 horas.`,
                ephemeral: true
            })

        const reminder = options.getString('reminder') === 'reminder'
        const inCachedData = await Database.Cache.General.get(`TopGG.${user.id}`)

        if (inCachedData?.messageUrl)
            return await interaction.reply({
                content: `${e.Deny} | Você já tem uma solicitação de voto em aberto.`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Ir para a solicitação',
                                emoji: e.antlink,
                                url: inCachedData.messageUrl,
                                style: 5
                            }
                        ]
                    }
                ],
                ephemeral: true
            })

        const msg = await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e.topgg} | Top.gg Bot List`,
                description: `${e.Loading} | Vote no site da Top.GG e sua recompensa aparecerá aqui.`
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'VOTAR',
                        emoji: e.Upvote,
                        url: Config.TopGGLink,
                        style: 5
                    },
                    {
                        type: 2,
                        label: 'CANCELR',
                        customId: JSON.stringify({ c: 'vote', src: 'cancelVote' }),
                        emoji: `${e.Trash}`,
                        style: 4
                    }
                ]
            }],
            fetchReply: true
        })

        return await Database.Cache.General.push(`TopGG.${user.id}`, {
            userId: user.id,
            channelId: channel.id,
            guildId: guild.id,
            messageId: msg.id,
            isReminder: reminder,
            messageUrl: msg.url
        })

    }
}