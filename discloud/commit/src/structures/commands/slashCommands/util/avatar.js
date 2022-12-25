import fetch from 'node-fetch'
import {
    ApplicationCommandOptionType,
    Routes,
    RouteBases
} from 'discord.js'

export default {
    name: 'avatar',
    description: '[util] Um simples comando para ver o avatar das pessoas',
    category: "util",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Selecione um usuário para ver o avatar',
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'show',
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
        description: 'Confira o avatar/banner/imagem customizada por perfil de alguém'
    },
    async execute({ interaction, client, e }) {

        const { options, guild, user: authorMember } = interaction
        const user = options.getUser('user') || authorMember
        const hide = options.getString('show') === 'não'
        const member = await guild.members.fetch(user.id).catch(() => null)
        const userAvatarURL = user.avatarURL({ dynamic: true, size: 1024 })
        const memberAvatarURL = member?.avatarURL({ dynamic: true, size: 1024 })
        const userAvatarImage = user.displayAvatarURL({ dynamic: true, size: 1024 })
        const memberAvatarImage = member?.displayAvatarURL({ dynamic: true, size: 1024 })
        const banner = await get(user.id)

        const embeds = [{
            color: client.blue,
            description: `${e.Download} [Clique aqui](${userAvatarURL}) para baixar o avatar original de ${user.tag}`,
            image: { url: userAvatarImage }
        }]

        if (memberAvatarImage && userAvatarImage !== memberAvatarImage)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${memberAvatarURL}) para baixar o avatar no servidor de ${user?.tag || 'NomeDesconhecido'}`,
                image: { url: memberAvatarImage }
            })

        if (banner)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${banner}) para baixar o banner de ${user?.tag || 'NomeDesconhecido'}`,
                image: { url: banner }
            })

        return await interaction.reply({ embeds: [...embeds], ephemeral: hide })

        async function get(userId) {
            return await fetch(RouteBases.api + Routes.user(userId), {
                method: 'GET',
                headers: { 'Authorization': `Bot ${process.env.DISCORD_TOKEN}` }
            })
                .then(res => res.json())
                .then(user => {
                    if (user.code == 50035) return false
                    if (!user.banner) return false
                    return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}?size=2048`
                })
                .catch(() => false)
        }
    }
}