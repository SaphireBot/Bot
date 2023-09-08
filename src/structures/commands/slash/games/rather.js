import { ApplicationCommandOptionType } from 'discord.js'
import game from './rather/game.rather.js'
import gameOptions from './rather/options.rather.js'

export default {
    name: 'rather',
    description: '[games] O que você prefere?',
    category: "games",
    name_localizations: { "en-US": "rather", 'pt-BR': 'prefere' },
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'play',
            description: 'Você prefere isso ou aquilo?',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'options',
            description: 'Mais opções do comando',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'delete',
                    description: 'Delete uma questão do jogo',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
                {
                    name: 'edit',
                    description: 'Edite uma questão do jogo',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
                {
                    name: 'view',
                    description: 'Veja uma única questão',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
                {
                    name: 'questions',
                    description: 'Mais algumas funções',
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: 'Minhas perguntas',
                            value: 'myQuestions'
                        },
                        {
                            name: 'Sugerir uma nova pergunta',
                            value: 'suggest'
                        }
                    ]
                }
            ]
        }
    ],
    helpData: {
        description: 'Um simples jogo para escolher o que você prefere'
    },
    apiData: {
        name: "rather",
        description: "O que você prefere? Isso ou aquilo, ele ou ela?",
        category: "Diversão",
        synonyms: ["prefere"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'options')
            return gameOptions(interaction)

        return game(interaction)

    }
}