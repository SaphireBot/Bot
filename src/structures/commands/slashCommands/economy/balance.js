import { ApplicationCommandOptionType } from "discord.js"
import balanceOptions from './balance/manage.balance.js'

export default {
    name: 'balance',
    description: '[economy] Confira suas finanças',
    category: "economy",
    name_localizations: { "en-US": "balance", 'pt-BR': 'saldo' },
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Veja as finanças de alguém',
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'options',
            description: 'Mais opções do comando',
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ],
    async execute({ interaction, client, Database, config, e }) {

        const { options, guild, user: author } = interaction
        const option = options.getString('options') || false
        const hide = option === 'hide'
        const user = options.getUser('user') || author

        if (option && option !== 'hide') return balanceOptions(interaction, option, user)

        const MoedaCustom = await guild.getCoin()

        if (user.id === client.user.id)
            return await interaction.reply({
                content: `👝 | ${user.username} possui **∞ ${MoedaCustom}**`,
                ephemeral: hide
            })

        const userData = await Database.getUser(user.id)

        if (!userData)
            return await interaction.reply({
                content: `${e.Database} | DATABASE | Não foi possível obter os dados de **${user?.tag}** *\`${user.id}\`*`,
                ephemeral: true
            })

        const bal = userData?.Balance > 0 ? parseInt(userData?.Balance).currency() || 0 : userData?.Balance || 0
        const oculto = author.id === config.ownerId ? false : userData?.Perfil?.BalanceOcult
        const balance = oculto ? `||oculto ${MoedaCustom}||` : `${bal} ${MoedaCustom}`
        const NameOrUsername = user.id === author.id ? 'O seu saldo é de' : `${user?.tag} possui`

        return await interaction.reply({ content: `👝 | ${NameOrUsername} **${balance}**`, ephemeral: hide })

    }
}