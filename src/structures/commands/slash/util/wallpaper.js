import { ApplicationCommandOptionType } from "discord.js";
import generalWallpaper from "./wallpaper/general.wallpaper.js";
import searchAnime from "./wallpaper/searchAnime.wallpaper.js";
import { Emojis as e } from "../../../../util/util.js";

export default {
    name: 'wallpaper',
    description: '[util] Busque pelo wallpaper perfeito',
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'geral',
            description: 'Pesquise por um wallpaper geral',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'pesquisar',
                description: 'Pesquise por um wallpaper',
                type: ApplicationCommandOptionType.String,
                max_length: 100,
                required: true
            }]
        },
        {
            name: 'anime',
            description: 'Pesquise por um wallpaper de anime',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'anime_ou_personagem',
                description: 'Pesquise por um wallpaper',
                type: ApplicationCommandOptionType.String,
                max_length: 100,
                required: true
            }]
        }
    ],
    apiData: {
        name: "wallpaper",
        description: "Pesquise rapidamente por wallpapers",
        category: "Utilidades",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }, isRefresh, searchResource) {

        if (isRefresh || searchResource)
            return generalWallpaper(interaction, isRefresh, searchResource)

        const { options } = interaction
        const command = { geral: generalWallpaper, anime: searchAnime }[options.getSubcommand()]

        if (!command)
            return interaction.reply({ content: `${e.Deny} | Nenhuma sub-função foi encontrada. #1659994357` })

        return command(interaction)
    }
}