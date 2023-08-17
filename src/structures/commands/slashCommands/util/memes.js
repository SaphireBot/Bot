import { Emojis as e } from '../../../../util/util.js'
import { ApplicationCommandOptionType } from 'discord.js'
import sendMemes from '../../functions/memes/send.memes.js'

export default {
    name: 'memes',
    description: '[util] Comandos de memes',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'enviar',
            description: '[util] Envie um meme para análise',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'arquivo',
                    description: 'Arquivo de meme',
                    type: ApplicationCommandOptionType.Attachment,
                    required: true
                }
            ]
        },
        {
            name: 'visualizar',
            description: '[util] Visualizar os memes',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'funcao',
                    description: 'Função a ser executada',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    apiData: {
        name: "memes",
        description: "Um comando esquecido pelo tempo...",
        category: "Utilidades",
        synonyms: [],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client }) {

        return await interaction.reply({
            content: `${e.Loading} | Comando em construção`,
            ephemeral: true
        })

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'enviar')
            return sendMemes(interaction)


    }
}