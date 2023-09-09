import { ButtonStyle } from 'discord.js'
import { SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'

const prize = {
    '🦤': -1000,
    '🐭': 150,
    '🦆': 5000,
    '🐒': 1000,
    '🐔': 100,
    '🐦': 500,
    '⭐': 'Prêmio Acumulado'
}

export default {
    name: 'raspadinha',
    description: '[economy] Tente a sorte em uma raspadinha',
    category: "economy",
    dm_permission: false,
    type: 1,
    options: [],
    helpData: {
        title: `${e.raspadinha} Raspadinhas ${client.user.username}`,
        description: `${e.QuestionMark} Azar ou sorte? Na raspadinha você tem os dois!`,
        fields: [
            {
                name: '1 - Como jogar?',
                value: `É só iniciar o jogando pagando 100 MOEDA e clicar em todos as opções para ver se ganha algo`
            },
            {
                name: '2 - Vitórias e Derrotas',
                value: `Para você ganhar, você tem que ter a sorte de obter uma sequência de **3 emojis** ao clicar nos botões. Caso não tenha, já sabe, perdeu.`
            },
            {
                name: '3 - Prêmios',
                value: Object.entries(prize).sort((a, b) => a[1] - b[1]).map(value => `${value[0]} ${value[1]} MOEDA`).join('\n')
            },
            {
                name: '⭐ Prêmio Acumulado',
                value: 'O prêmio acumulado é todo o dinheiro pago em raspadinhas. Uma vez ganho, o prêmio é zerado.'
            }
        ],
        footer: { text: `Per Emoji Chance: ${((1 / Object.keys(prize).length) * 100).toFixed(2)}%` }
    },
    api_data: {
        name: "raspadinha",
        description: "Se você tem sorte, você pode conseguir algo nas raspadinhas.",
        category: "Economia",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, Moeda: moeda, Database }) {

        const { user } = interaction
        const userData = await Database.getUser(user.id)
        const userBalance = userData?.Balance || 0

        if (userBalance < 100)
            return await interaction.reply({
                content: `${e.Deny} | Você precisa ter pelo menos **100 ${moeda}** para abrir uma raspadinha.`,
                ephemeral: true
            })

        return await interaction.reply({
            content: `${e.QuestionMark} | Para iniciar uma raspadinha, você precisa pagar **100 ${moeda}**.`,
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Comprar',
                        custom_id: JSON.stringify({ c: 'rasp', src: 'buy', id: user.id }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }]
        })

    }
}