import { Database, SaphireClient as client } from '../../../../classes/index.js';
import { ButtonStyle, Message } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'like',
    description: 'Curta alguém',
    aliases: ['curtir'],
    category: "profile",
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        if (!args[0] && !message.mentions.members.size)
            return message.reply({
                content: `${e.Animated.SaphireReading} | Você precisa me dizer para quem você quer dar o like, sabia?`
            })

        const { author } = message
        const user = await message.getUser(args[0])

        if (!user) return message.reply({ content: `${e.Animated.SaphireCry} | Eu não achei ninguém...` })
        if (user.id === client.user.id) return message.reply({ content: `Olha, parabéns pelo seu bom gosto, mas assim... Eu não preciso de likes não.` })
        if (user.id === author.id || user.bot) return message.reply({ content: `${e.Like} | Você não pode dar like para você mesmo e nem para bots, sabia?` })

        const dbData = await Database.getUsers([author.id, user?.id])
        const data = {}
        const authorData = dbData.find(d => d.id === author.id)

        if (!authorData)
            return message.reply({
                content: `${e.Database} | Nenhum dado seu foi encontrado. Acabei de efetuar o registro. Por favor, use o comando novamente.`
            })

        data.timeout = authorData?.Timeouts?.Rep

        if (Date.Timeout(1800000, data.timeout))
            return message.reply({
                content: `${e.Deny} | Calminha aí Princesa! Outro like só ${Date.Timestamp(new Date(data.timeout + 1800000), 'R', true)}`
            })

        const uData = dbData.find(d => d.id === user?.id)

        if (!uData) {
            Database.registerUser(user)
            return message.reply({
                content: `${e.Database} | Eu não encontrei **${user.username} *\`${user.id}\`***. Acabei de efetuar o registro. Por favor, use o comando novamente.`
            })
        }

        return message.reply({
            content: `${e.Animated.SaphireReading} | Para evitar robôs e farms excessivos, esse botãozinho é necessário. Só clicar nele e confirmar o like para ${user.global_name || user.username}`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Confirmar Like',
                            custom_id: JSON.stringify({ c: 'like', a: message.author.id, u: user.id }),
                            style: ButtonStyle.Success
                        }
                    ]
                }
            ]
        })

    }
}