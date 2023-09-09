import { ApplicationCommandOptionType } from "discord.js"
import buyRifa from "./rifa/buy.rifa.js"
import refundRifa from "./rifa/refund.rifa.js"
import tableRifa from "./rifa/table.rifa.js"
import verifyRifa from "./rifa/verify.rifa.js"

export default {
    name: 'rifa',
    description: '[economy] Um sistema diferente de rifas',
    category: "economy",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'comprar',
            description: 'Escolha um número e compre ele (01~90)',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            max_value: 90,
            autocomplete: true
        },
        {
            name: 'opções',
            description: 'Veja mais opções do comando aqui',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Visualizar tabela de números',
                    value: 'table'
                },
                {
                    name: 'Verificar último sorteio',
                    value: 'verify'
                },
                {
                    name: 'Reembolsar números comprados',
                    value: 'refund'
                }
            ]
        }

    ],
    api_data: {
        name: "rifa",
        description: "Compre suas rifas e boa sorte no sorteio.",
        category: "Economia",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, e, guildData }) {

        const { options } = interaction
        let command = options?.data[0]?.name || null

        if (!command)
            return await interaction.reply({
                content: `${e.Deny} | Comando não reconhecido.`,
                ephemeral: true
            })

        if (command === 'opções')
            command = options?.data[0]?.value

        const execute = {
            comprar: buyRifa,
            refund: refundRifa,
            table: tableRifa,
            verify: verifyRifa
        }[command] || null

        if (!execute)
            return await interaction.reply({
                content: `${e.Deny} | ExecuteCommand not found.`,
                ephemeral: true
            })

        return execute(interaction, guildData)
    }
}