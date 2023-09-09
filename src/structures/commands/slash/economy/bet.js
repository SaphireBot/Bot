import { ApplicationCommandOptionType } from 'discord.js'
import { Colors } from '../../../../util/Constants.js'
import diceBet from './bet/dice.bet.js'
import simpleBet from './bet/new.bet.js'
import refundValues from './bet/refund.bet.js'
import multiplier from './bet/lauch.multiplier.js'

export default {
    name: 'bet',
    description: '[economy] Sistema de aposta',
    category: "economy",
    name_localizations: { "en-US": "bet", 'pt-BR': 'aposta' },
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'simple',
            description: '[economy] Uma aposta simples',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'amount',
                    description: 'Quantia a ser apostada',
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                },
                {
                    name: 'players',
                    description: 'Quantidade máxima de jogadores',
                    type: ApplicationCommandOptionType.Integer,
                    max_value: 30,
                    min_value: 2
                },
                {
                    name: 'finish',
                    description: 'Tempo para a aposta se encerrar (Padrão: 1 Minuto)',
                    type: ApplicationCommandOptionType.Integer,
                    choices: [
                        {
                            name: '30 Segundos',
                            value: 30000
                        },
                        {
                            name: '1 Minuto',
                            value: 60000
                        },
                        {
                            name: '1 Minuto e 30 Segundos',
                            value: 90000
                        },
                        {
                            name: '2 Minutos',
                            value: 120000
                        }
                    ]
                },
                {
                    name: 'versus',
                    description: 'Escolha apenas 1 adversário',
                    type: ApplicationCommandOptionType.User
                }
            ]
        },
        {
            name: 'refund',
            description: '[economy] Resgate apostas perdidas com o tempo',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'available_bets',
                    description: 'Apostas abertas porém não finalizadas',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
            ]
        },
        {
            name: 'dice',
            description: '[economy] Aposte nos dados e boa sorte!',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'value',
                    type: ApplicationCommandOptionType.Integer,
                    description: 'Valor a ser apostado nos dados (min: 1)',
                    min_value: 1,
                    required: true
                }
            ]
        },
        {
            name: 'multiplier',
            name_localizations: { 'pt-BR': 'multiplicador' },
            description: '[economy] Aposte nos dados e boa sorte!',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'value',
                    description: 'Valor a ser apostado (min: 100)',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 100,
                    max_value: 100000,
                    required: true
                }
            ]
        }
    ],
    helpData: {
        color: Colors.Blue,
        title: 'Sistema de Aposta',
        description: 'Aqui você pode apostar dinheiro, ganhar e perder.',
        fields: [
            {
                name: '/bet dice',
                value: 'Escolha um valor e uma cor e tente a sorte nos dados.'
            },
            {
                name: '/bet simple',
                value: 'Escolha um valor e clique no emoji. Boa sorte!'
            },
            {
                name: '/bet refund',
                value: 'Resgate apostas que talvez se perderam com o vento.'
            },
            {
                name: '/emoji bet',
                value: 'Escolha um valor e escolha um emoji.'
            },
        ]
    },
    api_data: {
        name: "bet",
        description: "Um dos comandos de apostas mais poderosos do Discord.",
        category: "Economia",
        synonyms: ["aposta"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, e, client, Moeda, Database }) {

        const { options, user } = interaction
        const amount = options.getInteger('amount') || options.getInteger('value')
        const subCommand = options.getSubcommand()
        const userData = await Database.getUser(user.id)
        const userMoney = userData?.Balance || 0

        if (userMoney <= 0 || userMoney < amount)
            return interaction.reply({
                content: `${e.Deny} | Você não tem dinheiro suficiente.`,
                ephemeral: true
            })

        if (subCommand == 'multiplier') return multiplier(interaction)

        const execute = {
            simple: simpleBet,
            dice: diceBet,
            refund: refundValues
        }[subCommand]

        if (!execute)
            return interaction.reply({
                content: `${e.Deny} | Sub comando não encotrado.`,
                ephemeral: true
            })

        return execute({ interaction, e, amount, client, Moeda })

    }
}