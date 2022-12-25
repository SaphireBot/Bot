import { ButtonStyle, ChannelType } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, channel) => {

    if (channel.type === ChannelType.GuildCategory)
        return await interaction.reply({
            content: `${e.Deny} | Deverás interessante você estar tentando colocar uma categoria dentro de outra categoria...`
        })

    const { user, member, guild } = interaction
    const channels = await guild.channels?.cache?.toJSON()
    const parents = channels?.filter(ch => ch.type === ChannelType.GuildCategory && ch.id !== channel?.parentId)?.sort((a, b) => a.position - b.position)
    let allParents = [...parents]

    if (!parents || !parents.length)
        return await interaction.reply({
            content: `${e.Deny} | Este servidor não possui nenhuma categoria`,
            ephemeral: true
        })

    const components = [{
        type: 1,
        components: [{
            type: 3,
            custom_id: 'changeCategory',
            placeholder: 'Escolher categoria',
            options: []
        }]
    }]

    if (allParents.length > 25) {
        allParents = [allParents.slice(0, 25), allParents.slice(25, 50)]

        for (const parent of allParents[0]) {

            const channelsLength = channels?.filter(ch => ch.parentId === parent.id)?.length || 0

            components[0].components[0].options.push({
                label: parent.name.toUpperCase(),
                emoji: channelsLength > 0 ? '📂' : '📁',
                description: channelsLength === 1 ? `${channelsLength} Canal` : `${channelsLength} Canais`,
                value: JSON.stringify({ c: 'channel', pId: parent.id, cId: channel.id })
            })
        }

        const secondComponent = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'changeCategory2',
                placeholder: 'Escolher categoria',
                options: []
            }]
        }

        for (const parent of allParents[1]) {

            const channelsLength = channels?.filter(ch => ch.parentId === parent.id)?.length || 0

            secondComponent.components[0].options.push({
                label: parent.name.toUpperCase(),
                emoji: channelsLength > 0 ? '📂' : '📁',
                description: channelsLength === 1 ? `${channelsLength} Canal` : `${channelsLength} Canais`,
                value: JSON.stringify({ c: 'channel', pId: parent.id, cId: channel.id })
            })
        }

        components.push(secondComponent)
    }
    else
        for (const parent of parents) {

            const channelsLength = channels?.filter(ch => ch.parentId === parent.id)?.length || 0

            components[0].components[0].options.push({
                label: parent.name.toUpperCase(),
                emoji: channelsLength > 0 ? '📂' : '📁',
                description: channelsLength === 1 ? `${channelsLength} Canal` : `${channelsLength} Canais`,
                value: JSON.stringify({ c: 'channel', pId: parent.id, cId: channel.id })
            })
        }

    return await interaction.reply({
        content: `${e.Loading} | O canal ${channel} vai para qual categoria?`,
        components: [
            ...components,
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Cancelar comando',
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })
}