export default {
    name: 'balance',
    description: '[economy] Confira suas finanças',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Veja as finanças de alguém',
            type: 6
        },
        {
            name: 'database_users',
            description: 'Pesquise por um usuário no banco de dados',
            type: 3,
            autocomplete: true
        },
        {
            name: 'hide',
            description: 'Esconder a mensagem de resposta',
            type: 5
        }
    ],
    async execute({ interaction, client, Database, config, e }) {

        const { options, guild } = interaction
        const hide = options.getBoolean('hide') || false
        const user = options.getUser('user') || client.allUsers.find(data => data.id === options.getString('database_users')) || interaction.user
        const MoedaCustom = await guild.getCoin()

        if (user.id === client.user.id)
            return await interaction.reply({
                content: `👝 | ${user.username} possui **∞ ${MoedaCustom}**`,
                ephemeral: hide
            })

        const userData = await Database.User.findOne({ id: user.id }, 'Balance Perfil')

        if (!userData)
            return await interaction.reply({
                content: `${e.Database} | DATABASE | Não foi possível obter os dados de **${user?.tag}** *\`${user.id}\`*`,
                ephemeral: true
            })

        const bal = userData?.Balance > 0 ? parseInt(userData?.Balance).currency() || 0 : userData?.Balance || 0
        const oculto = interaction.user.id === config.ownerId ? false : userData?.Perfil?.BalanceOcult
        const balance = oculto ? `||oculto ${MoedaCustom}||` : `${bal} ${MoedaCustom}`
        const NameOrUsername = user.id === interaction.user.id ? 'O seu saldo é de' : `${user?.tag} possui`

        return await interaction.reply({ content: `👝 | ${NameOrUsername} **${balance}**`, ephemeral: hide })

    }
}