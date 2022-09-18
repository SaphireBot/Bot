import { ApplicationCommandOptionType } from 'discord.js'
import searchAnime from '../../functions/anime/search.anime.js'

export default {
    name: 'anime',
    description: '[util] Comandos referente a animes',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'search',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[util] Pesquise algúm anime usando este comando',
            options: [
                {
                    name: 'input',
                    description: 'Qual anime você quer pesquisar?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'in',
                    description: 'Você está pesquisando por...',
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: 'Anime',
                            value: 'anime'
                        },
                        {
                            name: 'Manga',
                            value: 'manga'
                        }
                    ],
                    required: true
                }
            ]
        }
    ],
    helpData: {
        description: 'Tudo sobre anime aqui'
    },
    async execute({ interaction }) {
        return searchAnime(interaction)
    }
}

