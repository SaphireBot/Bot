import { Config } from '../../../../util/Constants.js'
import axios from 'axios'

export default {
    name: 'vote',
    name_localizations: { "en-US": "topgg", 'pt-BR': 'votar' },
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
                },
                {
                    name: 'Voto aberto bugado',
                    value: 'reload'
                }
            ]
        }
    ],
    async execute({ interaction, client, Database, e }) {

        const { options, user, channel, guild } = interaction

        if (options.getString('reminder') === 'reload') return reload()

        const msg = await interaction.reply({ content: `${e.Loading} | Contactando Top.gg...`, fetchReply: true })

        const hasVoted = await axios.get(
            `https://top.gg/api/bots/912509487984812043/check?userId=${user.id}`,
            { headers: { authorization: process.env.TOP_GG_TOKEN } }
        )
            .then(res => res?.data?.voted === 1)
            .catch(() => 2)

        if (hasVoted === 2)
            return await interaction.editReply({
                content: `${e.cry} | Não foi possível falar com o Top.GG. Tente novamente daqui a pouco, ok?`
            }).catch(() => { })

        if (hasVoted)
            return await interaction.editReply({
                content: `${e.Deny} | Você já votou nas últimas 12 horas.`,
                ephemeral: true
            }).catch(() => { })

        const inCachedData = await Database.Cache.General.get(`TopGG.${user.id}`)
        if (inCachedData)
            return await interaction.editReply({
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
            }).catch(() => { })

        await interaction.editReply({
            content: null,
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
        }).catch(() => { })

        return await Database.Cache.General.set(`TopGG.${user.id}`, {
            userId: user.id,
            channelId: channel.id,
            guildId: guild.id,
            messageId: msg.id,
            isReminder: options.getString('reminder') === 'reminder',
            messageUrl: msg.url
        })

        async function reload() {
            const data = await Database.Cache.General.get(`TopGG.${user.id}`)

            if (!data)
                return await interaction.reply({
                    content: `${e.Deny} | Você não tem nenhuma solicitação de voto em aberto.`,
                    ephemeral: true
                })

            await Database.Cache.General.delete(`TopGG.${user.id}`)
            const channelCached = await guild.channels.fetch(data?.channelId || '0').catch(() => null)
            if (!channel)
                return await interaction.reply({
                    content: `${e.Check} | Canal não encontrado. Porém, eu fechei a solicitação no banco de dados.`,
                    ephemeral: true
                })

            const message = await channelCached.messages.fetch(data?.messageId || '0').catch(() => null)
            if (!message)
                return await interaction.reply({
                    content: `${e.Check} | Mensagem não encontrada. Porém, eu fechei a solicitação no banco de dados.`,
                    ephemeral: true
                })

            await message.delete().catch(() => { })
            return await interaction.reply({
                content: `${e.Check} | Solicitação de voto fechada com sucesso.`,
                ephemeral: true
            })
        }

    }
}