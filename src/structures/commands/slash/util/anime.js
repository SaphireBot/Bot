import { ApplicationCommandOptionType } from 'discord.js'
import searchAnime from '../../functions/anime/search.anime.js'
import wallpaperAnime from '../../functions/anime/wallpaper.anime.js'
import indications from '../../functions/anime/indications.anime.js'

export default {
    name: 'anime',
    description: '[util] Comandos referente a animes',
    category: "util",
    dm_permission: false,
    database: false,
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
                },
                {
                    name: 'options',
                    description: 'Mais opções do comando Anime Search',
                    type: ApplicationCommandOptionType.String,
                    choices: [{
                        name: 'Esconder a mensagem só pra mim',
                        value: 'hide'
                    }]
                }
            ]
        },
        // {
        //     name: 'wallpaper',
        //     type: ApplicationCommandOptionType.Subcommand,
        //     description: '[util] Olhe os melhores wallpapers de animes aqui',
        //     options: [
        //         {
        //             name: 'search',
        //             description: 'Pesquise por um wallpaper',
        //             type: ApplicationCommandOptionType.String,
        //             autocomplete: true
        //         },
        //         {
        //             name: 'indicate',
        //             description: 'Indique um anime para a Saphire\'s Team adicionar ao pacote.',
        //             max_length: '200',
        //             type: ApplicationCommandOptionType.String
        //         }
        //     ]
        // },
        {
            name: 'indications',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[util] Receba indicações de animes',
            options: [
                {
                    name: 'search',
                    type: ApplicationCommandOptionType.String,
                    description: 'Veja um anime específico presente no banco de dedos.',
                    autocomplete: true
                },
                {
                    name: 'more_options',
                    type: ApplicationCommandOptionType.String,
                    description: 'Mais opções do comando de indicações aqui.',
                    choices: [
                        {
                            name: 'Indicar um anime',
                            value: 'indicate'
                        },
                        {
                            name: 'Meus animes indicados',
                            value: 'myAnimes'
                        },
                        {
                            name: 'Créditos',
                            value: 'credits'
                        }
                    ]
                }
            ]
        }
    ],
    helpData: {
        description: 'Tudo sobre anime aqui'
    },
    apiData: {
        name: "anime",
        description: "Indicações & Pesquisas de animes é aqui!",
        category: "Utilidades",
        synonyms: [],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'search')
            return searchAnime(interaction, options.getString('options') === 'hide')

        if (subCommand === 'wallpaper')
            return wallpaperAnime(interaction)

        if (subCommand === 'indications')
            return indications(interaction)
    }
}