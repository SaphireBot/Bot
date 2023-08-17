import { Database, SaphireClient as client } from "../../../../classes/index.js"
import { Colors } from "../../../../util/Constants.js"
import { socket } from "../../../../websocket/websocket.js"

export default {
    name: 'pig',
    description: '[economy] Tente quebrar o porquinho e ganhe todo o dinheiro dele',
    name_localizations: { "en-US": "pig", 'pt-BR': 'porco' },
    category: "economy",
    dm_permission: false,
    type: 1,
    options: [{
        name: 'options',
        description: 'O que fazer por aqui?',
        type: 3,
        required: true,
        choices: [
            {
                name: 'Tentar a sorte no pig (1000 Safiras)',
                value: 'try'
            },
            {
                name: 'Ver o status atual do pig',
                value: 'status'
            }
        ]
    }],
    helpData: {
        description: 'Ao quebrar o porquinho, você ganha todas as moedas dele'
    },
    apiData: {
        name: "pig",
        description: "Tente quebrar o porquinho e ganhe tudo o que tiver nele",
        category: "Economia",
        synonyms: ["porco"],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, clientData, e }) {

        const { options, user, guild } = interaction
        const option = options.getString('options')
        const authorData = await Database.getUser(user.id)
        const porquinho = clientData?.Porquinho
        const PorquinhoMoney = porquinho?.Money || 0
        const LastWinner = porquinho?.LastWinner || 'Ninguém por enquanto'
        const LastPrize = porquinho?.LastPrize || 0
        const moeda = await guild.getCoin() || `${e.Coin} Safiras`
        const timeOut = authorData?.Timeouts.Porquinho

        if (option === 'status')
            return await interaction.reply({
                embeds: [
                    {
                        color: Colors.Gold,
                        title: `${e.Pig} Status`,
                        description: `Tente quebrar o Pig e ganhe todo o dinheiro dele`,
                        fields: [
                            {
                                name: 'Último ganhador',
                                value: `${LastWinner}\n${LastPrize}${moeda}`,
                                inline: true
                            },
                            {
                                name: 'Montante',
                                value: `${PorquinhoMoney} ${moeda}`,
                                inline: true
                            }
                        ]
                    }
                ]
            })

        if (Date.Timeout(30000, timeOut))
            return await interaction.reply({
                content: `${e.Deny} | Tente quebrar o ${e.Pig} novamente ${Date.GetTimeout(30000, timeOut, 'R')}`,
                ephemeral: true
            })

        const money = authorData?.Balance || 0

        if (money < 1000) return await interaction.reply({
            content: `${e.Deny} | Você não possui dinheiro pra apostar no pig. Quantia mínima: **1000 ${moeda}**.`,
            ephemeral: true
        })

        await Database.Client.updateOne(
            { id: client.user.id },
            { $inc: { 'Porquinho.Money': 1000 } }
        )

        return Math.floor(Math.random() * 100) === 1 ? PigBroken() : lose()

        async function lose() {

            const transaction = {
                time: `${Date.format(0, true)}`,
                data: `${e.loss} Apostou 1000 Safiras no porquinho.`
            }

            socket?.send({
                type: "transactions",
                transactionsData: { value: 1000, userId: user.id, transaction }
            })

            await Database.User.findOneAndUpdate(
                { id: user.id },
                {
                    $set: { 'Timeouts.Porquinho': Date.now() },
                    $inc: { Balance: -1000 },
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

            return await interaction.reply({
                content: `${e.Deny} | Não foi dessa vez! Veja o status: \`/pig options:Ver o status atual do pig\`\n-1000 ${moeda}!`
            })
        }

        async function PigBroken() {

            const transaction = {
                time: `${Date.format(0, true)}`,
                data: `${e.gain} Ganhou ${PorquinhoMoney} quebrando o porquinho.`
            }

            socket?.send({
                type: "transactions",
                transactionsData: { value: PorquinhoMoney, userId: user.id, transaction }
            })

            await Database.User.findOneAndUpdate(
                { id: user.id },
                {
                    $set: { 'Timeouts.Porquinho': Date.now() },
                    $inc: { Balance: PorquinhoMoney },
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

            await interaction.reply({
                content: `${e.Check} | ${user} quebrou o porquinho e conseguiu +${PorquinhoMoney} ${moeda}`
            })

            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    Porquinho: {
                        LastPrize: PorquinhoMoney,
                        LastWinner: `${user.username}\n*${user.id}*`,
                        Money: 0
                    }
                }
            )

            return
        }

    }
}