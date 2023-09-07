import { SaphireClient as client } from '../../../../classes/index.js';
import { Message, Routes, User } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'avatar',
    description: '[util] Veja o avatar das pessoas',
    aliases: ['pfp', 'banner'],
    category: "util",
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        /**
         * @type { User }
         */
        const user = message.mentions.members.size
            ? message.mentions.members.first()?.user
            : args[0]?.length > 0
                ? client.users.cache.get(args[0])
                || await message.guild.members.fetch(args[0]).then(m => m.user).catch(() => null)
                || await client.rest.get(Routes.user(args[0].replace(/([^\d])+/gim, '')))
                    .then(u => {
                        client.users.cache.set(u.id, u)
                        return u
                    })
                    .catch(() => message.author)
                || message.author
                : message.author

        const member = user?.id == message.author.id
            ? message.member
            : message.mentions.members.first() || message.guild.members.cache.get(user?.id) || await message.guild.members.fetch(args[0]).catch(() => null)

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