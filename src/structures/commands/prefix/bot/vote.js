import { Message, parseEmoji } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { SaphireClient as client, Database } from '../../../../classes/index.js'
import { Config } from '../../../../util/Constants.js'

export default {
    name: 'vote',
    description: '[bot] Vote no Top.GG',
    aliases: ['topgg', 'votar'],
    category: "bot",
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        const { author: user, channel, guild } = message

        if (['reload', 'relogar', 'close', 'fechar', 'exit'].includes(args[0]?.toLowerCase())) return reload()

        const msg = await message.reply({ content: `${e.Loading} | Contactando Top.gg...` })

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
            return msg.edit({ content }).catch(() => { })

        const inCachedData = await Database.Cache.General.get(`TopGG.${user.id}`)
        if (inCachedData)
            return msg.edit({
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
                ]
            }).catch(() => { })

        await Database.Cache.General.set(`TopGG.${user.id}`, {
            userId: user.id,
            channelId: channel.id,
            guildId: guild.id,
            messageId: msg.id,
            isReminder: ['reminder', 'lembrar', 'lembrete'].includes(args[0]?.toLowerCase()),
            messageUrl: msg.url
        })

        return msg.edit({
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
                return message.reply({ content: `${e.Deny} | Você não tem nenhuma solicitação de voto em aberto.` })

            await Database.Cache.General.delete(`TopGG.${user.id}`)
            client.pushMessage({ method: 'delete', channelId: data.channelId, messageId: data.messageId })
            return message.reply({ content: `${e.Check} | Solicitação de voto fechada com sucesso.` })
        }

    }
}