import { ApplicationCommandOptionType } from 'discord.js'

export default {
    name: 'admin',
    description: '[admin] Comandos administrativos',
    category: "admin",
    dm_permission: false,
    admin: true,
    database: false,
    type: 1,
    options: [
        {
            name: 'register',
            description: '[admin] Registre um servidor ou usuário no banco de dados',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    description: 'ID do usuário a ser registrado',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
                {
                    name: 'server',
                    description: 'ID do servidor a ser registrado',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
            ]
        },
        {
            name: 'delete',
            description: '[admin] Delete algo do banco de dados',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    description: 'ID do usuário a ser deletado',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
                {
                    name: 'server',
                    description: 'ID do servidor a ser deletado',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
            ]
        },
        {
            name: 'commands',
            description: '[admin] Libere e bloqueie comandos',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'blocked_commands',
                    description: 'Selecione um comando para liberar',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
                {
                    name: 'command',
                    description: 'Selecione um comando para bloquear',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
            ]
        },
        {
            name: 'test',
            description: '[admin] Comando de teste',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'id',
                    type: ApplicationCommandOptionType.String,
                    description: 'sdsasd'
                }
            ]
        },
        {
            name: 'fetch_guild_members',
            description: '[admin] Executa um fetch em membros de algum servidor',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'guild_id',
                    type: ApplicationCommandOptionType.String,
                    description: 'ID do servidor',
                    required: true
                }
            ]
        },
        {
            name: 'fanart',
            description: '[admin] Comando para gerenciar fanarts',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'add',
                    description: 'Adicionar uma nova fanart',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'commit',
            description: '[admin] Comando para atualizar o código fonte',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'discloud',
                    description: 'Arquivo do commit que será enviado para a Discloud',
                    type: ApplicationCommandOptionType.Attachment
                },
                {
                    name: 'api',
                    description: 'Arquivo a ser enviado para a API (Discloud Host)',
                    type: ApplicationCommandOptionType.Attachment
                }
            ]
        },
        {
            name: 'invite',
            description: '[admin] Comando para criar um convite de um servidor',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'server',
                    description: 'Servidor ou ID de um servidor',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'reboot',
            description: '[admin] Comando iniciar um reboot',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'message',
                    description: 'Mensagem e ser mostrada no reboot',
                    type: ApplicationCommandOptionType.String
                }
            ]
        },
        {
            name: 'backup',
            description: '[admin] Obter o backup salvo na API',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'password',
                    description: 'Insira a senha do backup',
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ]
        }
    ],
    helpData: {
        description: 'Comandos exclusivos para a equipe de administração'
    },
    async execute({ interaction, client, emojis: e }) {

        const { options, user } = interaction

        if (!client.admins.includes(user.id))
            return await interaction.reply({
                content: `${e.Deny} | Este é um recurso privado da Saphire's Team Administration.`,
                ephemeral: true
            })

        const subCommand = options.getSubcommand()

        return import('./admin/functions.admin.js').then(functions => functions.default(interaction, subCommand))

    }
}