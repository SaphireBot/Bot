import { SaphireClient as client } from '../../../../classes/index.js';
import { Message, Routes, User } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'avatar',
    description: 'Veja o avatar das pessoas',
    aliases: ['pfp', 'banner', 'icon', 'picture'],
    category: "util",
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        /**
         * @type { User }
         */
        const user = await message.getUser(args[0])
        const member = user?.id == message.author.id ? message.member : await message.getMember(user?.id)

        if (!user?.id && !member?.id)
            return message.reply({ content: `${e.Animated.SaphireCry} | Eu não achei ninguém em lugar nenhum...` }).catch(() => { })

        if (user.fetch) await user.fetch({ force: true }).catch(() => { })
        const userAvatarURL = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar?.includes('a_') ? "gif" : "png"}?size=2048` : null
        const memberAvatarURL = member?.avatar ? `https://cdn.discordapp.com/guilds/${message.guild.id}/users/${user.id}/avatars/${member.avatar}.${member.avatar?.includes('a_') ? "gif" : "png"}?size=2048` : null
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

        return message.reply({ content: null, embeds: [...embeds] })

    }
}