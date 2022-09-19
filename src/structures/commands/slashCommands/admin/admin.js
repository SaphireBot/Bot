import { ApplicationCommandOptionType } from 'discord.js'

export default {
    name: 'admin',
    description: '[admin] Comandos administrativos',
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