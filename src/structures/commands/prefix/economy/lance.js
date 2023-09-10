import { Database, SaphireClient as client } from '../../../../classes/index.js';
import { Message, time } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';
import timeMs from '../../../../functions/plugins/timeMs.js';

export default {
    name: 'lançar',
    description: 'Lance uma quantidade de Safiras no chat',
    aliases: ['lance'],
    category: "Economia",
    api_data: {
        tags: ['building'],
        perms: { user: [], bot: [] }
    },
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        const { author, channel } = message

        if (!args[0])
            return message.reply({
                content: `${e.MoneyWithWings} | Você pode lançar Safiras na Chat. Dentro de **30 segundos**, outros usuários lutaram para pegar as Safiras que você lançou.`
            })

        const dateNow = Date.now()
        const timePersonalize = args[1] ? timeMs(args.slice(1)) || 1000 * 30 : 1000 * 30

        if (
            timePersonalize > (1000 * 60 * 3)
            || timePersonalize < (1000 * 10)
        )
            return message.reply({ content: `${e.DenyX} | O tempo permitido é de 10 segundos a 3 minutos, ok?` })

        const value = args[0].toNumber()

        if (!value)
            return message.reply({
                content: `${e.DenyX} | Você precisa me dizer a quantia que você quer lançar no chat.`
            })

        const msg = await message.reply({
            content: `${e.Loading} | Carregando e lançando Safiras no chat...`
        })

        const data = await Database.getUser(author.id)
        const balance = data?.Balance || 0

        if (balance < value)
            return msg.edit({
                content: `${e.DenyX} | Você não tem tudo isso de Safiras. Você tem apenas **${balance.currency()} Safiras**.`
            }).catch(() => { })

        const result = await Database.editBalanceWithTransaction(
            author.id,
            `${e.loss} Lançou ${value} Safiras no chat *${channel.name}*`,
            value,
            "sub"
        )

        if (result !== 'ok')
            return msg.edit({
                content: `${e.Animated.SaphirePanic} | Não foi possível lançar suas Safiras no chat.\n${e.bug} | \`${result}\``
            }).catch(() => { })

        return msg.edit({ content: `${e.MoneyWithWings} | **${author.globalName || author.username}** lançou **${value.currency()} Safiras** no chat.\n${e.Loading} | Sorteio do lance ${time(new Date(dateNow + timePersonalize), "R")}` })
            .then(raffle)
            .catch(err => {
                msg.delete().catch(() => { })
                channel.send({ content: `${e.Animated.SaphireReading} | Houve um erro ao lançar as Safiras no chat. Devolvi seu dinheirinho.\n${e.bug} | \`${err}\`` }).catch(() => { })
                return devolution()
            })

        async function raffle() {
            msg.react(e.MoneyWings)

            await Database.Cache.General.set(`Lance.${msg.id}`, { creator: author.id, value })

            const players = new Map()

            return msg.createReactionCollector({
                filter: (_, user) => !user.bot,
                time: timePersonalize
            })
                .on("create", (react) => {
                    if (react.emoji.id == '887372520343359578') return
                    return react.remove().catch(() => { })
                })
                .on("collect", async (_, user) => {
                    if (client.blacklist.has(user.id)) return
                    return players.set(user.id, true)
                })
                .on("end", async (_, reason) => {
                    await Database.Cache.General.delete(`Lance.${msg.id}`)

                    if (['messageDelete', 'channelDelete'].includes(reason)) {

                        if (reason == "messageDelete")
                            channel.send({ content: `${e.Animated.SaphireReading} | Como a mensagem do lançamento foi apagada, eu devolvi o dinheiro do lançamento.` }).catch(() => { })

                        players.clear()
                        return devolution()
                    }

                    if (!players.size) {
                        devolution()
                        const content = `${e.MoneyWithWings} | **${author.globalName || author.username}** lançou **${value.currency()} Safiras** no chat.\n${e.DenyX} | Ninguém participou do lançamento.`
                        return msg.edit({ content })
                            .catch(() => channel.send({ content }).catch(() => { }))
                    }

                    const winnerId = Array.from(players.keys())[Math.floor(Math.random() * players.size)]
                    const prize = value > 1000 ? value - parseInt(value * 0.05) : value

                    Database.editBalanceWithTransaction(
                        winnerId,
                        `${e.gain} Recebeu ${prize} Safiras em um lançamento no canal *${channel.name}*`,
                        prize,
                        "add"
                    )

                    const content = `${e.MoneyWithWings} | **${author.globalName || author.username}** lançou **${value.currency()} Safiras** no chat.\n👑 | <@${winnerId}> \`${winnerId}\` ganhou esse lance.${value > 1000 ? `\n${e.Taxa} | Lançamento acima de 1000 Safiras tem uma taxa de 5%. \`-${parseInt(value * 0.05)}\`` : ''}`
                    players.clear()
                    channel.send({ content }).catch(() => { })
                    return msg.edit({ content }).catch(() => { })

                })
                .on("remove", (_, user) => players.delete(user.id))

        }

        function devolution() {
            return Database.editBalanceWithTransaction(
                author.id,
                `${e.gain} Recebeu ${value} Safiras via *System Refund*`,
                value,
                "add"
            )
        }
    }
}