import { ButtonStyle, ChatInputCommandInteraction, User, time } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { SaphireClient as client } from "../../../../classes/index.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 * @param { String } guildId
 * @param { User | undefined } user
 */
export default async (interaction, guildId, user, allData) => {

    if (!allData.length)
        return interaction.editReply({
            content: `${e.DenyX} | Histórico de uso vázio.`,
            ephemeral: true
        }).catch(() => { })

    if (guildId && user)
        for (const registry of allData)
            registry.usage = registry.usage.filter(d => d.guildId == guildId && d.userId == user.id)
    else {

        if (guildId)
            for (const registry of allData)
                registry.usage = registry.usage.filter(d => d.guildId == guildId)

        if (user)
            for (const registry of allData)
                registry.usage = registry.usage.filter(d => d.userId == user.id)
    }

    const data = []
    for (const registry of allData)
        if (registry.usage.length)
            data.push(registry)

    if (!data.length)
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | Nenhum registro com o filtro informado foi encontrado.`,
            embeds: [], components: []
        }).catch(() => { })

    const components = []

    for (let i = 0; i < data.length; i += 25) {

        const selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: `${i}.menu`,
                placeholder: 'Selecionar comando',
                options: []
            }]
        }

        selectMenuObject
            .components[0]
            .options = data
                .slice(i, i + 25)
                .map(registry => ({
                    label: `${registry.id}`,
                    description: `${registry.usage.length} usos`,
                    value: registry.id
                }))

        components.push(selectMenuObject)
        continue
    }

    const buttonData = [
        { emoji: '⏮️', id: 'zero' },
        { emoji: '◀️', id: 'back' },
        { emoji: '▶️', id: 'next' },
        { emoji: '⏭️', id: 'last' },
        { emoji: e.DenyX, id: 'cancel' },
    ]

    const msg = await interaction.editReply({ content: `${e.Loading} | Selecione um comando para visualizar seu histórico`, embeds: [], components })
    let embeds = []
    let index = 0

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === interaction.user.id,
        idle: 1000 * 60 * 2
    })
        .on('collect', async int => {

            let customId;

            if (int.isStringSelectMenu()) customId = int.values[0]
            if (int.isButton()) customId = int.customId

            if (!buttonData.some(d => d.id == customId)) {
                await int.update({ content: `${e.Loading} | Alterando comando...`, embeds: [], components: [] }).catch(() => { })
                return refreshEmbed(customId)
            }

            if (customId == 'cancel') return collector.stop()

            if (customId == 'zero') index = 0
            if (customId == 'back') index--
            if (customId == 'next') index++
            if (customId == 'last') index = embeds.length - 1

            if (!embeds[index]) {
                if (customId == 'back') index = embeds.length - 1
                if (customId == 'next') index = 0
            }

            if (!embeds[index])
                return int.update({
                    content: `${e.Animated.SaphireCry} | As embed se perderam, ho my goshhh!`,
                    embeds: [], components: []
                }).catch(() => { })

            return int.update({ embeds: [embeds[index]] }).catch(() => { })
        })
        .on('end', () => {
            return interaction.editReply({
                content: `${e.DenyX} | Os coletores mistícos se colidiram e morreram.`,
                components: [], embeds: []
            }).catch(() => { })
        })

    function refreshEmbed(commandName) {

        const registry = data.find(d => d.id == commandName)

        if (!registry)
            return interaction.editReply({
                content: `${e.DenyX} | Nenhum registro foi encontrado.`,
                components: [], embeds: []
            }).catch(() => { })

        embeds = []
        let pages = 1
        index = 0

        for (let i = 0; i < registry.usage.length; i += 5) {

            const registers = registry.usage.slice(i, i + 5)
            if (!registers.length) break;

            const embed = {
                color: client.blue,
                title: `Command Usage History - ${commandName} - Page ${pages}`,
                description: registers
                    .map(d => `Server: \`${d.guildId || 0}\`\nUser: \`${d.userId || 0}\`\nChannel: \`${d.channelId || 0}\`\nTipo: \`${d.type || 0}\`\nData: ${time(d.date, 'f')}`)
                    .join('\n-------------\n'),
                fields: [{
                    name: `${e.Upvote} Usos`,
                    value: `**${registry.usage.length}** registros encontrados do comando **/${commandName}**.`
                }]
            }

            if (guildId || user)
                embed.fields.push({
                    name: '🔍 Filtros',
                    value: `${guildId ? `Guild ID: ${guildId}` : ''}${user ? `User ID: ${user.id}` : ''}`
                })

            embeds.push(embed)
            pages++
            continue
        }

        return interaction.editReply({
            content: null,
            embeds: [embeds[0]],
            components: [
                ...components,
                {
                    type: 1,
                    components: buttonData.map(({ emoji, id: custom_id }, i) => ({
                        type: 2,
                        emoji,
                        custom_id,
                        style: i == buttonData.length - 1 ? ButtonStyle.Danger : ButtonStyle.Primary,
                        disabled: i == buttonData.length - 1 ? false : embeds.length == 1
                    }))
                }
            ]
        })
    }

}