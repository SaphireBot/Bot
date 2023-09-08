import { ApplicationCommandOptionType } from 'discord.js'
import indexAnime from '../../functions/staff/index.anime.js'

export default {
    name: 'staff',
    description: '[bot] Comando exclusívo para a Saphire\'s Team',
    category: "bot",
    dm_permission: false,
    database: false,
    type: 1,
    staff: true,
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
                    description: '[bot] Deletar um anime do pacote',
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
                    description: '[bot] Deletar um wallpaper de um anime',
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
        },
        {
            name: 'logomarca',
            description: '[staff] Comando para gerenciar o conteúdo do comando logomarca',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'new',
                    description: '[staff] Adicionar uma nova logo/marca',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'marca',
                            description: 'Nome da logo/marca',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: 'image_url_sem_censura',
                            description: 'Link da imagem sem censura',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: 'image_url_com_censura',
                            description: 'Link da imagem com censura',
                            type: ApplicationCommandOptionType.String
                        },
                        {
                            name: 'sinonimo',
                            description: 'Adicionar um sinônimo a marca',
                            type: ApplicationCommandOptionType.String
                        },
                        {
                            name: 'outro_sinonimo',
                            description: 'Adicionar um sinônimo a marca',
                            type: ApplicationCommandOptionType.String
                        }
                    ]
                },
                {
                    name: 'edit',
                    description: '[staff] Edite uma marca',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'select_logo_marca',
                            description: 'Selecione uma logo/marca',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true
                        },
                        {
                            name: 'name',
                            description: 'Edite o nome da logo/marca',
                            type: ApplicationCommandOptionType.String
                        },
                        {
                            name: 'add_sinonimo',
                            description: 'Adicionar um novo sinônimo',
                            type: ApplicationCommandOptionType.String
                        },
                        {
                            name: 'remove_sinonimo',
                            description: 'Adicionar um novo sinônimo',
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true
                        },
                        {
                            name: 'editar_imagem_com_censura',
                            description: 'Editar imagem da logo/marca',
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true
                        },
                        {
                            name: 'editar_imagem_sem_censura',
                            description: 'Editar imagem da logo/marca',
                            type: ApplicationCommandOptionType.String
                        }
                    ]
                },
                {
                    name: 'delete',
                    description: '[staff] Deletar uma logo/marca',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'select_logo_marca',
                            description: 'Selecione uma logo/marca',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true
                        }
                    ]
                }
            ]
        }
    ],
    apiData: {
        name: "staff",
        description: "Comando privado para a Staff da Saphire.",
        category: "Saphire",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    execute({ interaction, client, emojis: e }) {

        if (!client.staff || !client.staff.length || !client.staff.includes(interaction.user.id))
            return interaction.reply({
                content: `${e.Deny} | Este é um recurso privado a Saphire's Team.`,
                ephemeral: true
            })

        return indexAnime(interaction)
    }
}