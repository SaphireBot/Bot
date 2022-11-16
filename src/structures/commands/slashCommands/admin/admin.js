import { ApplicationCommandOptionType } from 'discord.js'

export default {
    name: 'admin',
    description: '[admin] Comandos administrativos',
    category: "admin",
    dm_permission: false,
    admin: true,
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
            options: []
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