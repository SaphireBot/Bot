import { Message, User } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { SaphireClient as client, Database } from '../../../../classes/index.js'
import { Config } from '../../../../util/Constants.js'

export default {
    name: 'balance',
    description: 'Comando para ver o saldo',
    aliases: ['bal', 'saldo', 'atm', 'carteira  '],
    category: "economy",
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        if (message.mentions.members.size > 1 || args.length > 1) return multiMentions()

        /**
         * @type { User }
         */
        const user = await message.getUser(args[0])

        if (!user?.id)
            return message.reply({ content: `${e.Animated.SaphireCry} | Eu não achei ninguém...` })

        const userData = await Database.getUser(user.id)

        if (!userData)
            return message.reply({ content: `${e.Animated.SaphireReading} | Parece que não tem nada no meu banco de dados referente ao usuário **${user.username} \`${user.id}\`**` })

        const MoedaCustom = await message.guild.getCoin()
        const bal = userData?.Balance > 0 ? parseInt(userData?.Balance).currency() || 0 : userData?.Balance || 0
        const oculto = message.author.id === Config.ownerId ? false : userData?.Perfil?.BalanceOcult
        const balance = user.id == client.user.id ? `∞ ${MoedaCustom}` : oculto ? `||oculto ${MoedaCustom}||` : `${bal} ${MoedaCustom}`
        const NameOrUsername = user.id === message.author.id ? 'O seu saldo é de' : `${user?.globalName || user?.username} possui`

        return message.reply({ content: `👝 | ${NameOrUsername} **${balance}**` })

        async function multiMentions() {
            const msg = await message.reply({ content: `${e.Loading} | Buscando os usuários perdidos no Discord...` })
            const mentions = await message.getMultipleUsers()

            if (!mentions?.length)
                return message.reply({ content: `${e.Animated.SaphireCry} | Eu não achei ninguém que você disse...` })

            await msg.edit({ content: `${e.Animated.SaphireReading} | Buscando os dados de ${mentions.length} usuários no banco de dados...` }).catch(() => { })
            const usersData = await Database.getUsers(mentions.map(m => m.id))

            if (!usersData?.length)
                return message.reply({ content: `${e.Animated.SaphireCry} | Não achei os dados de ninguém.` })

            const MoedaCustom = await message.guild.getCoin()
            const content = mentions.map(mention => {

                const userData = usersData.find(d => d.id == mention.id)
                const bal = userData?.Balance > 0 ? parseInt(userData?.Balance).currency() || 0 : userData?.Balance || 0
                const oculto = message.author.id === Config.ownerId ? false : userData?.Perfil?.BalanceOcult
                const balance = mention.id == client.user.id ? `∞ ${MoedaCustom}` : oculto ? `||oculto ${MoedaCustom}||` : `${bal} ${MoedaCustom}`
                const NameOrUsername = `${mention.user?.globalName || mention.user?.username || mention?.globalName || mention?.username} \`${mention.id}\` possui`

                return `👝 | ${NameOrUsername} **${balance}**`
            })

            for (let i = 0; i < content.length; i += 25)
                i == 0
                    ? msg.edit({ content: content.slice(0, 25).join('\n') })
                    : message.channel.send({ content: content.slice(i, i + 25).join('\n') })
            return
        }

    }
}