import { SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import { ButtonStyle } from 'discord.js'

export default async interaction => {

    const { user } = interaction
    const allCommands = [...client.slashCommands.toJSON()] // { name: '', description: '' }
        .map(cmd => ({
            name: cmd.description ? `/${cmd.name.toLowerCase()}` : `APP: ${cmd.name}`,
            description: cmd.description
        }))
        .sort((a, b) => a.name < b.name ? -1 : 1)

    const embeds = EmbedGenerator(allCommands) || []

    if (!embeds.length)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum painel de comandos foi gerado.`,
            ephemeral: true
        })

    const buttons = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Pu final',
                emoji: e.saphireLeft,
                custom_id: 'left',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: `1/${embeds.length}`,
                custom_id: '0',
                style: ButtonStyle.Secondary,
                disabled: true
            },
            {
                type: 2,
                label: 'Pra lá',
                emoji: e.saphireRight,
                custom_id: 'right',
                style: ButtonStyle.Primary
            }
        ]
    }

    const messageData = { embeds: [embeds[0]] }

    if (embeds.length > 1) {
        messageData.components = [buttons]
        messageData.fetchReply = true
    }

    const msg = await interaction.reply(messageData)
    if (!embeds.length) return

    let embedIndex = 0

    return msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 60000 * 3,
        dispose: true,
        componentType: 2 // Button
    })
        .on('collect', async buttonInteraction => {

            const { customId } = buttonInteraction

            buttons.components[2].label = 'Pra lá'
            buttons.components[0].label = 'Pra cá'

            if (customId === 'right') {
                embedIndex++
                if (embedIndex > embeds.length - 1) embedIndex = 0
            }

            if (customId === 'left') {
                embedIndex--
                if (embedIndex < 0) embedIndex = embeds.length - 1
            }

            buttons.components[1].label = `${embedIndex + 1}/${embeds.length}`
            if (embedIndex === embeds.length - 1) buttons.components[2].label = 'Pu começo'
            if (embedIndex === 0) buttons.components[0].label = 'Pu final'
            return await buttonInteraction.update({ embeds: [embeds[embedIndex]], components: [buttons] })
        })
        .on('end', async () => {

            const embed = msg.embeds[0]?.data

            if (!embed) return

            embed.color = client.red
            embed.footer = { text: `${embed.footer.text} | Comando encerrado.` }
            return await msg.edit({
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: 'Cabô',
                        emoji: e.saphireDesespero,
                        custom_id: '0',
                        style: ButtonStyle.Secondary,
                        disabled: true
                    }]
                }]
            })
        })
}

function EmbedGenerator(array) {

    let amount = 10
    let page = 1
    const embeds = []

    for (let i = 0; i < array.length; i += 10) {

        let current = array.slice(i, amount)
        let fields = current.map(cmd => ({
            name: cmd.name ? `${cmd.name}` : 'Nome não encontrado',
            value: cmd.description || 'Descrição não encontrada'
        }))

        embeds.push({
            color: client.blue,
            title: `${e.Commands} Todos os comandos`,
            fields: fields,
            footer: { text: `${array.length} Comandos` }
        })

        page++
        amount += 10

    }

    return embeds
}