import { ButtonStyle } from "discord.js"
import { SaphireClient as client, Database } from "../../../classes/index.js"
import { Emojis as e } from "../../../util/util.js"

export default new class ChestManager {
    constructor() {
        this.counter = {}
        this.guildEnabled = {}
    }

    async load(guildsData) {
        for (const data of guildsData)
            if (data.Chest !== false) this.guildEnabled[data.id] = true

        return setInterval(() => this.execute(), 1000 * 60 * 60)
    }

    add(guildId, channelId) {
        if (!this.counter[guildId]) this.counter[guildId] = {}
        return this.counter[guildId][channelId]
            ? this.counter[guildId][channelId]++
            : this.counter[guildId][channelId] = 1
    }

    async execute() {
        const channelsId = await this.selectChannels()
        this.sendSapphireChest(channelsId)
        this.counter = {}
        return
    }

    async selectChannels() {

        const data = []
        for await (const guildId of Object.keys(this.counter)) {
            const channelsData = Object.entries(this.counter[guildId] || {}).filter(data => (data[1] || 0) >= 1000)
            if (!channelsData.length) continue
            data.push(channelsData.sort((a, b) => b[1] - a[1])[0])
            continue
        }

        if (!data.length) return []
        const fill = data.filter(i => i) || []
        if (!fill.length) return []
        return fill.sort((a, b) => b[1] - a[1]).slice(0, 5).map(arr => arr[0])
    }

    /**
     * @param { ["channelId1", "channelId2", "channelId3", "channelId4", "channelId5"] } data 
     */
    async sendSapphireChest(data) {

        for (const channelId of data) {
            const channel = client.channels.cache.get(channelId)
            if (!channel) continue
            await channel.send({
                content: `${e.SaphireChest} | Um **Sapphire Chest** apareceu!`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Pegar',
                                custom_id: 'catch',
                                style: ButtonStyle.Success
                            },
                            {
                                type: 2,
                                label: 'O que é isso?',
                                custom_id: JSON.stringify({ c: 'chest', src: 'info' }),
                                style: ButtonStyle.Primary
                            }
                        ]
                    }
                ]
            })
                .then(message => message.createMessageComponentCollector({
                    filter: interaction => interaction.customId == 'catch',
                    time: 1000 * 60,
                    max: 1
                })
                    .on('collect', interaction => {
                        if (interaction.customId !== 'catch') return
                        const prize = this.getPrize()
                        this.setPrize(interaction.user.id, prize.coins, prize.exp)
                        return interaction.update({
                            content: `${e.SaphireChest} | ${interaction.user} \`${interaction.user.id}\` ganhou **${(prize.coins || 0).currency()} ${e.Coin} Safiras** & **${(prize.exp || 0).currency()} ${e.RedStar} Experiêncas**.`,
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            label: 'Pegar',
                                            custom_id: 'catch',
                                            style: ButtonStyle.Success,
                                            disabled: true
                                        },
                                        {
                                            type: 2,
                                            label: 'O que é isso?',
                                            custom_id: JSON.stringify({ c: 'chest', src: 'info' }),
                                            style: ButtonStyle.Primary
                                        }
                                    ]
                                }
                            ]
                        })

                    })
                    .on('end', (_, reason) => {

                        if (['time', 'idle'].includes(reason))
                            return message.edit({
                                content: `${e.SaphireChest} | O Sapphire Chest recarregou e continuou sua jornada.`,
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: 'Pegar',
                                                custom_id: 'catch',
                                                style: ButtonStyle.Success,
                                                disabled: true
                                            },
                                            {
                                                type: 2,
                                                label: 'O que é isso?',
                                                custom_id: JSON.stringify({ c: 'chest', src: 'info' }),
                                                style: ButtonStyle.Primary
                                            }
                                        ]
                                    }
                                ]
                            }).catch(() => { })

                        return

                    }))
                .catch(() => { })

        }
        return
    }

    getPrize() {
        const prize = {
            coins: Math.floor(Math.random() * 50000),
            exp: Math.floor(Math.random() * 4000)
        }

        if (prize.coins < 1000) prize.coins = 1000
        if (prize.exp < 500) prize.exp = 500
        return prize
    }

    async setPrize(userId, coins, exp) {
        await Database.User.updateOne(
            { id: userId },
            { $inc: { Balance: coins || 0, Xp: exp || 0 } },
            { upsert: true }
        )
        return
    }
}