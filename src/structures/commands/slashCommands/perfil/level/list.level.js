import { ChatInputCommandInteraction, ButtonStyle } from 'discord.js'
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const message = await interaction.reply({
        content: `${e.Loading} | Carregando todos os dados de todos wallpapers...`,
        fetchReply: true
    })

    const embeds = Object
        .entries(Database.BgLevel)
        .map(([bg, wallpaper]) => ({
            color: client.blue,
            title: `🖼️ Background Viewer`,
            description: `🏷️ \`${bg}\` ${wallpaper.Name}\n💰 ${wallpaper.Price || 0} Safiras\n${e.boxes} Estoque: ${wallpaper.Limit == -1 ? "Ilimitado" : wallpaper.Limit == 0 ? "Esgotado" : `${wallpaper.Limit ? `+${wallpaper.Limit}` : '+999'}`}`,
            image: { url: wallpaper.Image }
        }))

    await interaction.editReply({
        content: null,
        embeds: [embeds[0]],
        components: [
            {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'menu',
                    placeholder: 'Selecionar Wallpaper',
                    options: Object
                        .values(Database.BgLevel)
                        .slice(0, 25)
                        .map((wallpaper, i) => ({
                            label: wallpaper.Name,
                            emoji: '🖼️',
                            description: `Estoque: ${wallpaper.Limit == -1 ? "Ilimitado" : wallpaper.Limit == 0 ? "Esgotado" : `${wallpaper.Limit ? `+${wallpaper.Limit}` : '+999'}`}`,
                            value: `${i}`,
                        }))
                }]
            },
            {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'menu1',
                    placeholder: 'Selecionar Wallpaper',
                    options: Object
                        .values(Database.BgLevel)
                        .slice(25, 50)
                        .map((wallpaper, i) => ({
                            label: wallpaper.Name,
                            emoji: '🖼️',
                            description: `Estoque: ${wallpaper.Limit == -1 ? "Ilimitado" : wallpaper.Limit == 0 ? "Esgotado" : `${wallpaper.Limit ? `+${wallpaper.Limit}` : '+999'}`}`,
                            value: `${i + 25}`,
                        }))
                }]
            },
            {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'menu3',
                    placeholder: 'Selecionar Wallpaper',
                    options: Object
                        .values(Database.BgLevel)
                        .slice(50, 75)
                        .map((wallpaper, i) => ({
                            label: wallpaper.Name,
                            emoji: '🖼️',
                            description: `Estoque: ${wallpaper.Limit == -1 ? "Ilimitado" : wallpaper.Limit == 0 ? "Esgotado" : `${wallpaper.Limit ? `+${wallpaper.Limit}` : '+999'}`}`,
                            value: `${i + 50}`,
                        }))
                }]
            },
            {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'menu4',
                    placeholder: 'Selecionar Wallpaper',
                    options: Object
                        .values(Database.BgLevel)
                        .slice(75, 100)
                        .map((wallpaper, i) => ({
                            label: wallpaper.Name,
                            emoji: '🖼️',
                            description: `Estoque: ${wallpaper.Limit == -1 ? "Ilimitado" : wallpaper.Limit == 0 ? "Esgotado" : `${wallpaper.Limit ? `+${wallpaper.Limit}` : '+999'}`}`,
                            value: `${i + 75}`,
                        }))
                }]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '⏮️',
                        custom_id: '<<',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '◀️',
                        custom_id: '<',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '▶️',
                        custom_id: '>',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '⏭️',
                        custom_id: '>>',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Compar',
                        emoji: '💳',
                        custom_id: 'buy',
                        style: ButtonStyle.Success
                    }
                ]
            }
        ]
    }).catch(() => { })

    let index = 0
    return message.createMessageComponentCollector({
        filter: () => true,
        idle: 1000 * 60 * 2,
    })
        .on('collect', int => {

            if (int.customId == 'buy') return buy(int, index)

            if (int.user.id !== interaction.user.id)
                return interaction.reply({
                    content: `${e.Deny} | Você não pode clicar aqui, sabia?`,
                    ephemeral: true
                })

            if (int.values)
                index = parseInt(int.values[0])
            else {
                const customId = int.customId
                if (customId == '<<') index = 0
                if (customId == '<') index = embeds[index - 1] ? index - 1 : embeds.length - 1
                if (customId == '>') index = embeds[index + 1] ? index + 1 : 0
                if (customId == '>>') index = embeds.length - 1
            }

            return int.update({ embeds: [embeds[index]] }).catch(() => { })
        })
        .on('end', () => interaction.editReply({
            content: `${e.Animated.SaphireReading} | Os coletores morreram e o visualizador foi encerrado.`,
            components: [], embeds: []
        }).catch(() => { }))

    async function buy(int, index) {

        await int.reply({
            content: `${e.Animated.SaphireReading} | Buscando seus dados...`,
            ephemeral: true
        })

        const wallpaper = Object.entries(Database.BgLevel)[index]
        const userData = await Database.getUser(int.user.id)

        if (userData?.Walls?.Bg?.includes(wallpaper[0]))
            return int.editReply({
                content: `${e.Animated.SaphireReading} | Estou vendo aqui e você já possui o wallpaper **${wallpaper[1].Name}**.`
            }).catch(() => { })

        const designer = await client.users.fetch(wallpaper[1].Designer)
            .then(u => `🖌️ ${u.username} \`(${u.id})\``)
            .catch(() => "")

        return int.editReply({
            content: null,
            embeds: [{
                color: client.blue,
                title: `🖼️ ${client.user.username}'s Levels Background`,
                description: `🏷️ \`${wallpaper[0]}\` ${wallpaper[1].Name}\n💰 ${wallpaper[1].Price} Safiras\n${designer}`,
                image: { url: wallpaper[1].Image || null }
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Comprar Wallpaper',
                            emoji: '💳',
                            custom_id: JSON.stringify({ c: 'bg', src: 'buy', id: wallpaper[0], cmt: designer ? wallpaper[1].Designer : null }),
                            style: ButtonStyle.Success
                        }
                    ]
                }
            ]
        }).catch(() => { })

    }

}