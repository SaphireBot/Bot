import { ApplicationCommandOptionType } from 'discord.js'
import Blackjack from './blackjack/blackjack.class.js'

export default {
    name: 'blackjack',
    description: '[games] Um simples jogo de blackjack',
    category: "games",
    type: 1,
    dm_permission: false,
    options: [
        {
            name: 'solo',
            description: '[games] Escolha um modo de jogo para jogar solo',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'mode',
                    description: 'Modos de jogo',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        // {
                        //     name: 'Hidden - Você não sabe a primeira carta',
                        //     value: 'hidden'
                        // },
                        {
                            name: 'Dealer - Jogue contra o Dealer',
                            value: 'luck'
                        }
                    ]
                },
                {
                    name: 'bet',
                    description: 'Aposte no blackjack e boa sorte',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1
                },
                {
                    name: 'packs',
                    description: 'Quantos baralhos você quer nesta rodada?',
                    type: ApplicationCommandOptionType.Integer,
                    choices: [
                        {
                            name: '1 Baralho',
                            value: 1
                        },
                        {
                            name: '2 Baralhos',
                            value: 2
                        },
                        {
                            name: '3 Baralhos',
                            value: 3
                        },
                        {
                            name: '4 Baralhos',
                            value: 4
                        },
                        {
                            name: '5 Baralhos',
                            value: 5
                        },
                        {
                            name: '6 Baralhos',
                            value: 6
                        },
                        {
                            name: '7 Baralhos',
                            value: 7
                        },
                        {
                            name: '8 Baralhos',
                            value: 8
                        },
                    ]
                }
            ]
        },
        // {
        //     name: 'multiplayer',
        //     description: '[games] Escolha entre 1 a 8 oponentes e se divirta',
        //     type: ApplicationCommandOptionType.Subcommand,
        //     options: [
        //         {
        //             name: 'player2',
        //             description: 'Escolha um oponente',
        //             type: ApplicationCommandOptionType.User,
        //             required: true
        //         },
        //         {
        //             name: 'player3',
        //             description: 'Escolha um oponente',
        //             type: ApplicationCommandOptionType.User,
        //         },
        //         {
        //             name: 'player4',
        //             description: 'Escolha um oponente',
        //             type: ApplicationCommandOptionType.User
        //         },
        //         {
        //             name: 'player5',
        //             description: 'Escolha um oponente',
        //             type: ApplicationCommandOptionType.User
        //         },
        //         {
        //             name: 'player6',
        //             description: 'Escolha um oponente',
        //             type: ApplicationCommandOptionType.User
        //         },
        //         {
        //             name: 'player7',
        //             description: 'Escolha um oponente',
        //             type: ApplicationCommandOptionType.User
        //         },
        //         {
        //             name: 'bet',
        //             description: 'Aposte no blackjack e boa sorte',
        //             type: ApplicationCommandOptionType.Integer,
        //             min_value: 1
        //         },
        //         {
        //             name: 'packs',
        //             description: 'Quantos baralhos você quer nesta rodada?',
        //             type: ApplicationCommandOptionType.Integer,
        //             choices: [
        //                 {
        //                     name: '1 Baralho',
        //                     value: 1
        //                 },
        //                 {
        //                     name: '2 Baralhos',
        //                     value: 2
        //                 },
        //                 {
        //                     name: '3 Baralhos',
        //                     value: 3
        //                 },
        //                 {
        //                     name: '4 Baralhos',
        //                     value: 4
        //                 },
        //                 {
        //                     name: '5 Baralhos',
        //                     value: 5
        //                 },
        //                 {
        //                     name: '6 Baralhos',
        //                     value: 6
        //                 },
        //                 {
        //                     name: '7 Baralhos',
        //                     value: 7
        //                 },
        //                 {
        //                     name: '8 Baralhos',
        //                     value: 8
        //                 },
        //             ]
        //         }
        //     ]
        // },
        {
            name: 'refund',
            description: '[games] Resgate seus blackjack que se perderam com o vento',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'blackjacks',
                    description: 'Escolha qual blackjack você quer resgatar',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true
                }
            ]
        }
    ],
    helpData: {
        description: 'Blackjack - Preguiça de escrever aqui',
        permissions: [],
        fields: []
    },
    async execute({ interaction, guildData }) {
        return new Blackjack(interaction, guildData).validateOptions()
    }
}