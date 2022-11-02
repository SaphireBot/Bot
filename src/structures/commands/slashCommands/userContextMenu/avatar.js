import fetch from 'node-fetch'
import('dotenv/config')

export default {
    name: 'Avatar',
    dm_permission: false,
    category: "context menu",
    type: 2,
    async execute({ interaction, client, e }) {

        const { targetId, guild } = interaction
        const member = guild.members.cache.get(targetId)
        const user = member.user
        const userAvatarURL = user.avatarURL({ dynamic: true, size: 1024 })
        const memberAvatarURL = member?.avatarURL({ dynamic: true, size: 1024 })
        const userAvatarImage = user.displayAvatarURL({ dynamic: true, size: 1024 })
        const memberAvatarImage = member?.displayAvatarURL({ dynamic: true, size: 1024 })
        const banner = await get(user.id, 2048, "png", true)
        const embeds = [
            {
                color: client.blue,
                description: `${e.Download} [Clique aqui](${userAvatarURL}) para baixar o avatar original de ${user.tag}`,
                image: { url: userAvatarImage }
            }
        ]

        if (memberAvatarImage && userAvatarImage !== memberAvatarImage)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${memberAvatarURL}) para baixar o avatar no servidor de ${member?.user?.tag || 'NomeDesconhecido'}`,
                image: { url: memberAvatarImage }
            })

        if (banner)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${banner}) para baixar o banner de ${member?.user?.tag || 'NomeDesconhecido'}`,
                image: { url: banner }
            })

        return interaction.reply({ embeds: [...embeds], ephemeral: true })

        async function createBannerURL(userId, banner, format = "webp", size = "1024", dynamic) {
            if (dynamic) format = banner.startsWith("a_") ? "gif" : format
            return `https://cdn.discordapp.com/banners/${userId}/${banner}.${format}${parseInt(size) ? `?size=${parseInt(size)}` : ''}`
        }

        async function get(userId, size, format, dynamic) {
            return await fetch(`https://discord.com/api/v10/users/${userId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bot ${process.env.DISCORD_TOKEN}` }
            })
                .then(res => res.json())
                .then(user => {
                    if (user.code == 50035) return false
                    if (!user.banner) return false
                    if (user.banner) return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}?size=2048`
                })
                .catch(() => false)
        }
    }
}