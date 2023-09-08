import { ApplicationCommandOptionType } from 'discord.js';

export default {
    name: 'avatar',
    description: '[util] Um simples comando para ver o avatar das pessoas',
    category: "util",
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'user',
            name_localization: { 'pt-BR': 'usuário' },
            description: 'Selecione um usuário para ver o avatar',
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'show',
            name_localization: { 'pt-BR': 'mostrar_mensagem' },
            description: 'Mostrar avatar para todo mundo',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Sim! Pode mostrar para todos o avatar',
                    value: 'sim'
                },
                {
                    name: 'Não! Não mostre para ninguém! Só pra mim',
                    value: 'não'
                }
            ]
        }
    ],
    helpData: {
        description: 'Confira o avatar/banner/imagem customizada do perfil de alguém'
    },
    apiData: {
        name: "avatar",
        description: "Confira o avatar/banner/imagem do perfil de alguém",
        category: "Utilidades",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client, e }) {

        await interaction.reply({
            content: `${e.Loading} | Carregando avatar...`,
            ephemeral: interaction.options.getString('show') === 'não'
        })

        const user = interaction.options.getUser('user') || interaction.user
        const member = user.id == interaction.user.id ? interaction.member : interaction.options.getMember('user')

        await user.fetch().catch(() => { })
        if (member) await member.fetch().catch(() => null)
        const userAvatarURL = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar?.includes('a_') ? "gif" : "png"}?size=2048` : null
        const memberAvatarURL = member?.avatar ? `https://cdn.discordapp.com/guilds/${interaction.guild.id}/users/${user.id}/avatars/${member.avatar}.${member.avatar?.includes('a_') ? "gif" : "png"}?size=2048` : null
        const banner = user.banner ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner?.includes('a_') ? "gif" : "png"}?size=2048` : null

        const embeds = []

        if (userAvatarURL)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${userAvatarURL}) para baixar o avatar original de ${user.username}`,
                image: { url: userAvatarURL }
            })

        if (memberAvatarURL)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${memberAvatarURL}) para baixar o avatar no servidor de ${user?.username || 'NomeDesconhecido'}`,
                image: { url: memberAvatarURL }
            })

        if (banner)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${banner}) para baixar o banner de ${user?.username || 'NomeDesconhecido'}`,
                image: { url: banner }
            })
        return await interaction.editReply({ content: null, embeds: [...embeds] }).catch(() => { })

    }
}