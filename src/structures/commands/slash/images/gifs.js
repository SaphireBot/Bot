import { ApplicationCommandOptionType } from 'discord.js'
import emotionalGifData from './gifs/emotional.gifs.data.js'
import emotionalGifs from './gifs/emotional.gifs.js'
import interactionGifData from './gifs/interaction.gifs.data.js'
import interactionGifs from './gifs/interaction.gifs.js'
import measurer from './gifs/measurer.gifs.js'

const data = {
    name: 'gifs',
    description: '[gifs] Interações gerais',
    category: "images",
    name_localizations: { 'pt-BR': 'interações' },
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'interaction',
            name_localizations: { 'pt-BR': 'interagir' },
            description: '[gifs] Interagir com as pessoas é legal',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'action',
                    name_localizations: { 'pt-BR': 'ação' },
                    description: 'Qual é a sua interacação?',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: []
                },
                {
                    name: 'user',
                    name_localizations: { 'pt-BR': 'usuário' },
                    description: 'Usuário da interação',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'emotional',
            description: '[gifs] Tente demonstrar suas emoções por aqui',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'reaction',
                    description: 'Qual é a sua reação?',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: []
                },
                {
                    name: 'text',
                    description: 'Diga o que sente',
                    type: ApplicationCommandOptionType.String,
                }
            ]
        },
        {
            name: 'measurer',
            name_localizations: { 'pt-BR': 'medidor' },
            description: '[fun] Meça as "qualidades" de alguém',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'medida',
                    description: 'O que deve ser medido',
                    type: ApplicationCommandOptionType.String,
                    choices: [],
                    required: true
                },
                {
                    name: 'user',
                    name_localizations: { 'pt-BR': 'usuário' },
                    description: 'Quem é o usuário a ser medido?',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        }
    ]
}

for (let gif of interactionGifData)
    data.options[0].options[0].choices.push({ name: gif.name, value: gif.JSON })

for (let gif of emotionalGifData)
    data.options[1].options[0].choices.push({ name: gif.name, value: gif.JSON })

    data.options[2].options[0].choices = [
        {
            name: 'LGBTQIA+',
            value: 'lgbt'
        },
        {
            name: 'Gado Muuuuh',
            value: 'gado'
        },
        {
            name: 'Capacidade Cognitiva',
            value: 'cognitive'
        },
        {
            name: 'Ter Futuro',
            value: 'future'
        }
    ]

export default {
    ...data,
    api_data: {
        name: "gifs",
        description: "Vários tipos de interações em formato de gifs para você se expressar no Discord.",
        category: "Imagens",
        synonyms: ["interações"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, e }) {

        const subCommand = {
            interaction: [interactionGifs, interaction, interactionGifData],
            emotional: [emotionalGifs, interaction, emotionalGifData],
            measurer: [measurer, interaction, interaction.options.getUser('user'), interaction.options.getString('medida')]
        }[interaction.options.getSubcommand()]

        if (subCommand)
            return subCommand[0](...subCommand.slice(1))

        return await interaction.reply({
            content: `${e.DenyX} | Nenhum sub-comando encontrado. #1154844`,
            ephemeral: true
        })
    }
}