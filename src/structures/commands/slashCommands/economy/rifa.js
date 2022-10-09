import { ApplicationCommandOptionType } from "discord.js"
import buyRifa from "./rifa/buy.rifa.js"

export default {
    name: 'rifa',
    description: '[economy] Um sistema diferente de rifas',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'comprar',
            description: '[economy] Compre e aposte sua sorte',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'numero',
                    description: 'Escolha um número e compre ele (01~90)',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 90,
                    autocomplete: true
                },
                // {
                //     name: 'verificar',
                //     description: 'Verique o status de um número/tabela',
                //     type: ApplicationCommandOptionType.String,
                //     choices: [
                //         {
                //             name: 'Tabela completa',
                //             value: 'table'
                //         },
                //         {
                //             name: 'Número',
                //             value: 'number'
                //         }
                //     ]
                // }
            ]
        }
    ],
    helpData: {
        description: ''
    },
    async execute({ interaction, client, e }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'comprar')
            buyRifa(interaction)
    }
}