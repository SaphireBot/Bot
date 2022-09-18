import { ApplicationCommandOptionType } from 'discord.js'
import indexAnime from '../../functions/staff/index.anime.js'

export default {
    name: 'staff',
    description: '[bot] Comando exclusívo para a Saphire\'s Team',
    dm_permission: false,
    type: 1,
    admin: true,
    options: [
        {
            name: 'wallpaper',
            description: '[bot] Comandos do sistema de wallpaper',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'add',
                    description: '[bot] Adicionar um novo wallpaper',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'anime',
                            description: 'Anime a receber o wallpaper',
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true
                        },
                        {
                            name: 'url',
                            description: 'Url do wallpaper',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: 'create',
                    description: '[bot] Criar um novo anime',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Nome do novo anime',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: 'delete_anime',
                    description: '[bot] Delete um anime do pacote',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'anime',
                            description: 'Anime a ser deletado',
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true
                        }
                    ]
                },
                {
                    name: 'delete_wallpaper',
                    description: '[bot] Delete um wallpaper de um anime',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'anime',
                            description: 'Anime em que o wallpaper será deletado',
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true
                        }
                    ]
                },
            ]
        }
    ],
    async execute({ interaction, client, emojis: e }) {

        if (!client.staff || !client.staff.length || !client.staff.includes(interaction.user.id))
            return await interaction.reply({
                content: `${e.Deny} | Este é um recurso privado a Saphire's Team.`,
                ephemeral: true
            })

        return indexAnime(interaction)
    }
}