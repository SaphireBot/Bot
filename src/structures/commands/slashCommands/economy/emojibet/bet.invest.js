import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    return await interaction.reply({
        content: `${e.Loading} | Comando em construção...`,
        ephemeral: true
    })

    const { guild, user } = interaction
    const emojis = [
        ['1️⃣', '2️⃣', '3️⃣'],
        ['🇧🇷', '🏳️‍🌈', '🇺🇸'],
        ['🐶', '🐱', '🐨'],
        ['🍎', '🍓', '🍒'],
        ['🎱', '⚽', '🏀'],
        ['😀', '😊', '😇']
    ]

    // [{ Emoji: '', Users: [{ id: '123', value: 10 }] }]
    const emojisData = await Database.Economy.findOne({ id: client.user.id }, 'Emojis')
    const moeda = await guild.getCoin()
    const components = []
    
    const embeds = emojis.map(emojiArray => {

        const selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'menu',
                placeholder: 'Investir/Apostar em um emoji',
                options: []
            }]
        }

        for (let emoji of emojiArray)
            selectMenuObject.components[0].options.push({
                label: 'Investir neste emoji',
                emoji: emoji,
                description: 'Caso de vitória, terá um retorno de x0.00%',
                value: JSON.stringify({ c: 'invest', src: emoji }),
            })

        components.push([
            selectMenuObject,
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Anterior',
                        custom_id: 'left',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Próximo',
                        custom_id: 'right',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ])

        return {
            color: client.blue,
            title: `${emojis[5][0]} ${client.user.username}'s Emojis Invest`,
            description: emojiArray.map(emoji => {
                const emojiData = emojisData?.Emojis?.find(emoji => emoji?.Emoji === emoji)
                const totalUsers = emojiData?.Users || []
                const totalValue = emojiData ? 0 : totalUsers?.reduce((acc, att) => acc += att?.value, 0)
                return `${emoji} - (👥 ${totalUsers?.length}) - ${totalValue} ${moeda}`
            }).join('\n')
        }
    })

    let index = 0

    const msg = await interaction.reply({
        embeds: [embeds[0]],
        components: [...components[0]],
        fetchReply: true
    })

    return msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 60000,
        errors: ['idle']
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'right') {
                index++
                if (!embeds[index]) index = 0
            }

            if (customId === 'left') {
                index--
                if (!embeds[index]) index = embeds.length - 1
            }

            return await int.update({ embeds: [embeds[index]], components: [...components[index]] })

        })
        .on('end', async () => {
            const embed = embeds[index]
            embed.color = client.red
            embed.footer = { text: 'Comando encerrado' }

            return await interaction.editReply({
                embeds: [embed],
                components: []
            }).catch(() => { })
        })

}