import { ApplicationCommandOptionType } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
const thumbnailIcons = {
    broken: "https://media.discordapp.net/attachments/893361065084198954/1089006583788359742/broken.gif",
    flyingHearts: "https://media.discordapp.net/attachments/893361065084198954/1089006584203591720/higer.gif",
    complete: "https://media.discordapp.net/attachments/893361065084198954/1089007634876735528/complete.gif"
}

export default {
    name: 'ship',
    description: '[fun] Shippar alguém com outro alguém é algo incomum',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'userone',
            name_localization: { 'pt-BR': 'usuário1' },
            description: 'O primeiro usuário do ship',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'usertwo',
            name_localization: { 'pt-BR': 'usuário2' },
            description: 'O segundo usuário do ship',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    apiData: {
        name: "ship",
        description: "Veja o amor entre duas pessoas.",
        category: "Diversão",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client }) {

        const { options } = interaction
        const userone = options.getUser('userone')
        const usertwo = options.getUser('usertwo')

        if (userone.id == usertwo.id)
            return await interaction.reply({
                content: `${e.Deny} | Nada de shippar uma pessoa com a mesma pessoa, ok?`,
                ephemeral: true
            })

        const percent = Math.floor(Math.random() * 100) + 1
        const { emoji, url, description, result } = build()

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${emoji} ${client.user.username}'s Shipper`,
                thumbnail: { url },
                description: `${description}\n \n${result}`,
            }]
        })

        function build() {

            const hearts = { red: "❤️", white: "🤍", percent: percent, bar: [] }

            for (let i = 0; i < 10; i++) {
                hearts.percent > 1
                    ? hearts.bar.push(hearts.red)
                    : hearts.bar.push(hearts.white)
                hearts.percent -= 10
            }

            const userMention = `${userone} & ${usertwo}`
            const heartsRedLength = hearts.bar.filter(heart => heart == hearts.red).length
            const result = {
                0: { url: thumbnailIcons.broken, emoji: "🖤", description: `Entre  não existe amor algum entre ${userMention}.` },
                1: { url: thumbnailIcons.broken, emoji: "💔", description: `Nada é impossível, não é ${userMention}? Eu acho...` },
                2: { url: thumbnailIcons.broken, emoji: '💙', description: `A esperança, é a última que morre entre ${userMention}.` },
                3: { url: thumbnailIcons.broken, emoji: '❣️', description: `Nada que o tempo não resolva as coisas entre ${userMention}.` },
                4: { url: thumbnailIcons.broken, emoji: '💕', description: `Nada que um pouco de conversa entre ${userMention} não de certo.` },
                5: { url: thumbnailIcons.flyingHearts, emoji: '💘', description: `O futuro e o amor, é algo que precisa de esforço, para ambos os lados de ${userMention}.` },
                6: { url: thumbnailIcons.flyingHearts, emoji: '💗', description: `${userMention} tem um brilho único.` },
                7: { url: thumbnailIcons.flyingHearts, emoji: "💝", description: `Os deuses do amor olharam e sorriram para ${userMention}.` },
                8: { url: thumbnailIcons.complete, emoji: "💞", description: `Um futuro beirando a perfeição é algo que ${userMention} conhecerão.` },
                9: { url: thumbnailIcons.complete, emoji: "💖", description: `O amor, é algo que ${userMention} conhecem muito bem!` },
                10: { url: thumbnailIcons.complete, emoji: "❤️‍🔥", description: `${userMention} escreveram e definiram seus limites e suas incríveis histórias!!!` }
            }[heartsRedLength]

            if (heartsRedLength == 10)
                hearts.bar = hearts.bar.map(heart => heart = "❤️‍🔥")

            result.result = `${hearts.bar.join('')} **${percent}%**`

            return result
        }
    }
}