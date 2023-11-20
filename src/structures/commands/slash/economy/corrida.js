/*
ESTE COMANDO FOI IDEALIZADO POR 942070026519847002 ꨄ𝑚𝑜𝑜𝑛 𝑎𝑛𝑜𝑛𝑖𝑚𝑎ꨄ#3597
ESCRITO POR: 451619591320371213 Rody#1000
*/
import { ApplicationCommandOptionType, ButtonStyle } from "discord.js"
import { Colors } from '../../../../util/Constants.js'
import { Database } from "../../../../classes/index.js"
import { socket } from "../../../../websocket/websocket.js"
const emojis = ['🐍', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🙈', '🐵', '🐸', '🐨', '🐒', '🦁', '🐯', '🐮', '🐔', '🐧', '🐦', '🐤', '🦄', '🐴', '🐗', '🐺', '🦇', '🦉', '🦅', '🦤', '🦆', '🐛', '🦋', '🐌', '🐝', '🪳', '🪲', '🦗', '🦂', '🐢']

export default {
    name: 'run',
    description: '[economy] Aposte no seu anime e boa sorte',
    category: "economy",
    name_localizations: { "en-US": "run", 'pt-BR': 'corrida' },
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'players',
            description: 'Quantos jogadores pode entrar na corrida',
            type: ApplicationCommandOptionType.Integer,
            min_value: 2,
            max_value: 24,
            required: true
        },
        {
            name: 'distance',
            description: 'Distância a ser percorrida',
            type: ApplicationCommandOptionType.Number,
            required: true,
            max_value: 10,
            min_value: 3
        },
        {
            name: 'value',
            description: 'Valor a ser apostado',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1
        },
        {
            name: 'color',
            description: 'Escolha a cor da embed',
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ],
    helpData: {
        description: 'Escolha um emoji e boa sorte na corrida!',
        fields: [
            {
                name: `Emojis Avaliados - ${emojis.length}`,
                value: emojis.join(', ')
            }
        ]
    },
    api_data: {
        name: "run",
        description: "Uma corrida emocionante entre vários animais. Será que o seu irá ganhar?",
        category: "Economia",
        synonyms: ["corrida"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client, e, guildData }) {

        const { options, user: author, channel, guild } = interaction
        const runningChannels = await Database.Cache.Running.get(`${client.shardId}.Channels`)

        if (runningChannels?.includes(channel.id))
            return await interaction.reply({
                content: `${e.Deny} | Já tem uma corrida rolando neste chat. Espere ela acabar para iniciar outra, ok?`,
                components: guild.members.cache.get(author.id).isAdm
                    ? [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    emoji: '🔄',
                                    label: 'Resetar',
                                    custom_id: JSON.stringify({ c: 'corrida', src: 'reset' }),
                                    style: ButtonStyle.Primary
                                }
                            ]
                        }
                    ]
                    : [],
                ephemeral: true
            })

        const buttons = getButtons()
        const value = options.getInteger('value') || 0
        const players = options.getInteger('players')
        const limitToReach = options.getNumber('distance')
        const color = Colors[options.getString('color')] || client.blue
        const moeda = guildData?.Moeda || `${e.Coin} Safiras`
        let iniciated = false
        let total = 0

        const allButtons = () => [
            buttons[0].components[0],
            buttons[0].components[1],
            buttons[0].components[2],
            buttons[0].components[3],
            buttons[0].components[4],
            buttons[1].components[0],
            buttons[1].components[1],
            buttons[1].components[2],
            buttons[1].components[3],
            buttons[1].components[4],
            buttons[2].components[0],
            buttons[2].components[1],
            buttons[2].components[2],
            buttons[2].components[3],
            buttons[2].components[4],
            buttons[3].components[0],
            buttons[3].components[1],
            buttons[3].components[2],
            buttons[3].components[3],
            buttons[3].components[4],
            buttons[4].components[0],
            buttons[4].components[1],
            buttons[4].components[2],
            buttons[4].components[3],
            buttons[4].components[4]
        ]

        const embeds = [{
            color: color,
            title: `${author.username} iniciou uma Corrida de Animais`,
            description: `Valor da corrida: ${value} ${moeda}`,
            fields: [
                {
                    name: `${e.MoneyWings} Prêmio acumulado`,
                    value: `0 ${moeda}`
                },
                {
                    name: '👥 Participantes e seus animais',
                    value: 'Nenhum participante'
                },
                {
                    name: '🎯 Objetivo',
                    value: `Alcançar a distância ${limitToReach.toFixed(1)}`
                }
            ],
            footer: { text: `Limite de jogadores: ${players}` }
        }]

        const usersJoined = []

        await Database.Cache.Running.push(`${client.shardId}.Channels`, channel.id)

        const msg = await interaction.reply({
            embeds,
            components: buttons,
            fetchReply: true
        })

        const collector = msg.createMessageComponentCollector({
            filter: () => true,
            idle: 30000
        })
            .on('collect', async int => {

                const { customId, user } = int

                if (user.id === author.id && customId === 'init') {
                    iniciated = true
                    collector.stop()
                    return await initCorrida()
                }

                if (customId === 'init')
                    return await int.reply({
                        content: `${e.Deny} | Apenas ${author} pode iniciar esta corrida.`,
                        ephemeral: true
                    })

                if (usersJoined.find(u => u.id === user.id))
                    return await int.reply({
                        content: `${e.Info} | Você já entrou na corrida.`,
                        ephemeral: true
                    })

                if (value > 0) {

                    const userData = await Database.getUser(user.id)
                    const userMoney = userData?.Balance || 0

                    if (!userMoney || userMoney < value)
                        return int.reply({
                            content: `${e.Deny} | Você não tem dinheiro o suficiente para entrar nesta corrida.`,
                            ephemeral: true
                        })

                    const transaction = {
                        time: `${Date.format(0, true)}`,
                        data: `${e.loss} Apostou ${value} Safiras em uma corrida de animais`
                    }

                    socket?.send({
                        type: "transactions",
                        transactionsData: { value, userId: user.id, transaction }
                    })

                    await Database.User.findOneAndUpdate(
                        { id: user.id },
                        {
                            $inc: { Balance: -value },
                            $push: {
                                Transactions: {
                                    $each: [transaction],
                                    $position: 0
                                }
                            }
                        },
                        { upsert: true, new: true }
                    )
                        .then(doc => Database.saveUserCache(doc?.id, doc))

                    total += value
                }

                const buttonsCommand = allButtons()
                const button = buttonsCommand.find(b => b.custom_id === customId)
                const animal = button.emoji

                button.disabled = true
                button.style = ButtonStyle.Primary

                usersJoined.push({
                    id: user.id,
                    animal: animal,
                    distance: 0.0,
                    dots: ''
                })

                embeds[0].fields[0].value = `${total} ${moeda}`
                embeds[0].fields[1].value = usersJoined.map(data => `${data.animal} <@${data.id}>`).join('\n')

                if (usersJoined.length >= players) {
                    iniciated = true
                    collector.stop()
                    return await initCorrida()
                }

                return await int.update({ embeds, components: buttons }).catch(() => { })
            })
            .on('end', async (_, r) => {

                if (iniciated) return
                if (usersJoined.length >= 2) return await initCorrida()

                await Database.Cache.Running.pull(`${client.shardId}.Channels`, channel.id)

                if (value > 0)
                    Database.add(author.id, value)

                if (r === 'idle')
                    return msg.edit({
                        content: `${e.Deny} | Corrida cancelada por falta de resposta.`,
                        embeds: [],
                        components: []
                    }).catch(() => { })

                return
            })

        async function initCorrida() {

            embeds[0].color = client.green
            embeds[0].footer = { text: embeds[0].footer.text + ' | Corrida Iniciada' }

            await msg.edit({ embeds, components: [] }).catch(() => { })

            if (usersJoined.length < 2) {
                await Database.Cache.Running.pull(`${client.shardId}.Channels`, channelId => channelId === channel.id)

                if (value > 0) {
                    await Database.User.updateMany(
                        { id: { $in: usersJoined.map(u => u.id) } },
                        {
                            $inc: {
                                Balance: value
                            }
                        }
                    )
                    Database.refreshUsersData(usersJoined.map(u => u.id))
                }

                return channel.send({
                    content: `${e.Deny} | A corrida foi iniciada com menos de 2 jogadores.`
                })
            }

            const data = () => usersJoined.map(d => `${d.distance.toFixed(2)} ${d.dots}${d.animal}`).join('\n').slice(0, 2000)

            let MessageRunning = await channel.send({
                content: data(),
                fetchReply: true
            })

            const atualize = setInterval(() => {

                for (let player of usersJoined) {

                    const distancePoints = [0.1, 0.4, 0.3, 0.2, 0.1, 0.1, 0.1, 0.5, 0.1]
                    const distanceIndex = Math.floor(Math.random() * distancePoints.length)
                    const dots = ['.', '....', '...', '..', '.', '.', '.', '.....', '.'][distanceIndex]

                    player.distance += distancePoints[distanceIndex]
                    player.dots += dots
                }

                const rank = usersJoined.sort((a, b) => b.distance - a.distance)

                if (rank[0].distance >= limitToReach)
                    return newWinner(atualize, MessageRunning, rank[0], data())

                return MessageRunning.edit({ content: data() })
                    .catch(async () => MessageRunning = await MessageRunning.channel.send({ content: data() }).catch(() => clearInterval(atualize)))

            }, 2500)

            return
        }

        async function newWinner(atualize, MessageRunning, winnerData, result) {

            clearInterval(atualize)
            MessageRunning.delete().catch(() => { })

            await Database.Cache.Running.pull(`${client.shardId}.Channels`, channelId => channelId === channel.id)

            if (total > 0) {

                const transaction = {
                    time: `${Date.format(0, true)}`,
                    data: `${e.gain} Ganhou ${total} Safiras em uma corrida de animais`
                }

                socket?.send({
                    type: "transactions",
                    transactionsData: { value: total, userId: winnerData.id, transaction }
                })

                await Database.User.findOneAndUpdate(
                    { id: winnerData.id },
                    {
                        $inc: { Balance: total },
                        $push: {
                            Transactions: {
                                $each: [transaction],
                                $position: 0
                            }
                        }
                    },
                    { upsert: true, new: true }
                )
                    .then(doc => Database.saveUserCache(doc?.id, doc))
            }

            embeds[0].fields[1].value = usersJoined.map((data, i) => {
                const crown = data.id === winnerData.id ? '👑' : ''
                return `${i + 1} ${data.animal} <@${data.id}> ${crown}`
            }).join('\n')

            if (result.length <= 1024)
                embeds[0].fields[3] = {
                    name: '🏁 Resultado',
                    value: `${result}`.limit('MessageEmbedFieldValue')
                }
            else embeds.push({
                color: client.green,
                title: '🏁 Resultado',
                description: `${result}`.limit('MessageEmbedDescription')
            })

            embeds[0].footer.text = `${usersJoined.length} jogadores participaram desta corrida`

            return channel.send({ embeds })

        }

        function getButtons() {

            let choosenEmojis = emojis.random(25)

            /*
              A1 A2 A3 A4 A5 
              B1 B2 B3 B4 B5 
              C1 C2 C3 C4 C5 
              D1 D2 D3 D4 D5 
              E1 E2 E3 E4 E5 
             */

            let aButtons = { type: 1, components: [] }
            let bButtons = { type: 1, components: [] }
            let cButtons = { type: 1, components: [] }
            let dButtons = { type: 1, components: [] }
            let eButtons = { type: 1, components: [] }

            for (let i = 0; i < 5; i++)
                aButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `a${i}`, style: ButtonStyle.Secondary })

            choosenEmojis.splice(0, 5)
            for (let i = 0; i < 5; i++)
                bButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `b${i}`, style: ButtonStyle.Secondary })

            choosenEmojis.splice(0, 5)
            for (let i = 0; i < 5; i++)
                cButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `c${i}`, style: ButtonStyle.Secondary })

            choosenEmojis.splice(0, 5)
            for (let i = 0; i < 5; i++)
                dButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `d${i}`, style: ButtonStyle.Secondary })

            choosenEmojis.splice(0, 5)
            for (let i = 0; i < 4; i++)
                eButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `e${i}`, style: ButtonStyle.Secondary })

            eButtons.components.push({ type: 2, label: 'Start', custom_id: 'init', style: ButtonStyle.Success })

            return [aButtons, bButtons, cButtons, dButtons, eButtons]
        }
    }
}