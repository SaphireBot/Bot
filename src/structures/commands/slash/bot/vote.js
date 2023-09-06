import { parseEmoji } from 'discord.js'
import { Config } from '../../../../util/Constants.js'

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
    apiData: {
        name: "vote",
        description: "Vote no TopGG e ganhe Safiras e Experiência.",
        category: "Saphire",
        synonyms: ["votar"],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client, Database, e }) {

        const { options, user, channel, guild } = interaction

        if (options.getString('reminder') === 'reload') return reload()

        const msg = await interaction.reply({ content: `${e.Loading} | Contactando Top.gg...`, fetchReply: true })

        const hasVoted = await new Promise(async (resolve) => {

            const timeout = setTimeout(() => resolve(504), 4000)

            fetch(`https://top.gg/api/bots/912509487984812043/check?userId=${user.id}`,
                { headers: { authorization: process.env.TOP_GG_TOKEN }, method: 'GET', })
                .then(async data => {
                    const res = await data.json()
                    if (data.status !== 200) return resolve(data.status)
                    resolve(res?.voted)
                    return clearTimeout(timeout)
                })
                .catch(() => {
                    resolve(null)
                    return clearTimeout(timeout)
                })
        })
        const content = {
            null: `${e.Animated.SaphireCry} | Não foi possível se conectar com o Top.GG. Tente novamente daqui a pouco, ok?`,
            1: `${e.Deny} | Você já votou nas últimas 12 horas.`,
            504: `${e.Animated.SaphireCry} | O Top.GG demorou muito pra responder...`,
            403: `${e.Animated.SaphirePanic} | O Top.GG não deixou eu me comunicar com eles... Pooooooxa.`
        }[hasVoted]
            || `${e.Deny} | Não foi possível verificar seu status no Top.gg. Por favor, tente novamente daqui a pouco, ok?\n${e.bug} | \`Status Code\` - \`${hasVoted}\``

        if (hasVoted !== 0)
            return interaction.editReply({ content }).catch(() => { })

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

        await Database.Cache.General.set(`TopGG.${user.id}`, {
            userId: user.id,
            channelId: channel.id,
            guildId: guild.id,
            messageId: msg.id,
            isReminder: options.getString('reminder') === 'reminder',
            messageUrl: msg.url
        })

        return interaction.editReply({
            content: null,
            embeds: [{
                color: client.blue,
                title: `${e.topgg} Top.gg Bot List`,
                description: `${e.Loading} Vote no site da Top.GG e sua recompensa aparecerá aqui.`
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'VOTAR',
                        emoji: parseEmoji(e.Upvote),
                        url: Config.TopGGLink,
                        style: 5
                    },
                    {
                        type: 2,
                        label: 'CANCELR',
                        custom_id: JSON.stringify({ c: 'vote', src: 'cancelVote' }),
                        emoji: parseEmoji(e.Trash),
                        style: 4
                    }
                ]
            }]
        }).catch(() => { })

        async function reload() {
            const data = await Database.Cache.General.get(`TopGG.${user.id}`)

            if (!data)
                return interaction.reply({
                    content: `${e.Deny} | Você não tem nenhuma solicitação de voto em aberto.`,
                    ephemeral: true
                })

            await Database.Cache.General.delete(`TopGG.${user.id}`)
            client.pushMessage({ method: 'delete', channelId: data.channelId, messageId: data.messageId })
            return interaction.reply({
                content: `${e.Check} | Solicitação de voto fechada com sucesso.`,
                ephemeral: true
            })
        }

    }
}