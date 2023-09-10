import { ApplicationCommandOptionType, time } from 'discord.js';
import { SaphireClient as client, Database } from '../../../../classes/index.js';
import { Emojis as e } from '../../../../util/util.js';
import timeMs from '../../../../functions/plugins/timeMs.js';

export default {
    name: 'lance',
    name_localizations: { 'pt-BR': 'lançar' },
    description: '[economy] Lance uma quantidade de Safiras no chat',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'value',
            description: 'Quantidade de Safiras para jogar no chat',
            type: ApplicationCommandOptionType.String,
            required: true,
            min_value: 1
        },
        {
            name: 'time',
            description: 'Tempo em que o lance ficará ativo (Mix: 3s | Max: 3m)',
            type: ApplicationCommandOptionType.String
        }
    ],
    api_data: {
        name: "lance",
        description: "Lance uma quantidade de Safiras no chat",
        category: "Economia",
        synonyms: ["lançar"],
        tags: [],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const { user: author, channel, options } = interaction
        const value = (options.getString("value")).toNumber()
        const timeGiven = options.getString("time")
        const dateNow = Date.now()
        const timePersonalize = timeGiven ? timeMs(timeGiven) || 1000 * 30 : 1000 * 30

        if (
            timePersonalize > (1000 * 60 * 3)
            || timePersonalize < (1000 * 10)
        )
            return interaction.reply({ content: `${e.DenyX} | O tempo permitido é de 10 segundos a 3 minutos, ok?` })

        if (!value)
            return interaction.reply({
                content: `${e.DenyX} | Você precisa me dizer a quantia que você quer lançar no chat.`
            })

        const msg = await interaction.reply({
            content: `${e.Loading} | Carregando e lançando Safiras no chat...`,
            fetchReply: true
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
            let messages = 0

            await Database.Cache.General.set(`Lance.${msg.id}`, { creator: author.id, value })

            const players = new Map()
            const messageCollector = channel.createMessageCollector({ filter: () => true })
                .on("collect", () => messages++)

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
                    messageCollector.stop()
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
                    if (messages > 5)
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