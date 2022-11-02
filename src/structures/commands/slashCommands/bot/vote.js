import { Config } from '../../../../util/Constants.js'
import { Api } from '@top-gg/sdk'

export default {
    name: 'vote',
    description: '[bot] Vote no Top.gg e ganhe uma recompensa',
    category: "bot",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'new',
            description: '[bot] Mais opções do comando vote.',
            type: 1,
            options: [
                {
                    name: 'reminder',
                    description: 'Ative um lembrete automático para o próximo voto',
                    type: 3,
                    required:  true,
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
            ]
        },
        {
            name: 'list',
            description: '[bot] Veja a lista de votos',
            type: 1,
            options: [
                {
                    name: 'search_user',
                    description: 'Pesquise por um usuário',
                    type: 3,
                    autocomplete: true
                },
                {
                    name: 'check_member',
                    description: 'Pesquise por um membro',
                    type: 6
                }
            ]
        }
    ],
    async execute({ interaction, client, Database, e }) {

        const { options, user, channel } = interaction

        const optionChoice = options.getSubcommand()
        if (optionChoice === 'list') return import('../../functions/vote/list.vote.js').then(list => list.default(interaction))

        const TopGG = new Api(process.env.TOP_GG_TOKEN)
        const hasVoted = await TopGG.hasVoted(user.id)

        if (hasVoted)
            return await interaction.reply({
                content: `${e.Deny} | Você já votou nas últimas 12 horas.`,
                ephemeral: true
            })

        const reminder = options.getString('reminder') === 'reminder'
        const cachedData = await Database.Cache.General.get(`${client.shardId}.TopGG`)
        const inCachedData = cachedData?.find(data => data.userId === user.id)

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

        return await Database.Cache.General.push(`${client.shardId}.TopGG`, {
            userId: user.id,
            channelId: channel.id,
            messageId: msg.id,
            isReminder: reminder,
            messageUrl: msg.url
        })

    }
}
