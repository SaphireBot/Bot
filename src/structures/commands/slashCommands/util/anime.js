import { ApplicationCommandOptionType } from 'discord.js'
import searchAnime from '../../functions/anime/search.anime.js'
import wallpaperAnime from '../../functions/anime/wallpaper.anime.js'

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
        },
        {
            name: 'wallpaper',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[util] Olhe os melhores wallpapers de animes aqui',
            options: [
                {
                    name: 'search',
                    description: 'Pesquise por um wallpaper',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
                {
                    name: 'indicate',
                    description: 'Indique um anime para a Saphire\'s Team adicionar ao pacote.',
                    max_length: '200',
                    type: ApplicationCommandOptionType.String
                }
            ]
        }
    ],
    helpData: {
        description: 'Tudo sobre anime aqui'
    },
    async execute({ interaction }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'search')
            return searchAnime(interaction)

        if (subCommand === 'wallpaper')
            return wallpaperAnime(interaction)
    }
}