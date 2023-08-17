import { ButtonStyle, ChatInputCommandInteraction, time } from "discord.js"
import { Database, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import loadAndShowCommands from "./multicommands.saphire.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 * @param { String | undefined } commandName
 */
export default async interaction => {

    const commandName = interaction.options.getString('command')
    const guildId = interaction.options.getString('server')
    const user = interaction.options.getUser('user')

    if (!commandName && !guildId && !user)
        return interaction.reply({
            content: `${e.DenyX} | Nenhum comando, servidor ou usuário foi selecionado.`,
            ephemeral: true
        })

    const content = commandName || guildId || user
        ? `${e.Loading} | Buscando e filtrando o histórico de comandos usados, um minuto...`
        : `${e.Loading} | Buscando o histórico de comandos...`

    const msg = await interaction.reply({ content, fetchReply: true })
    let data = await Database.Commands.find()

    if (!data.length)
        return interaction.editReply({ content: `${e.DenyX} | Histórico vázio.` }).catch(() => { })

    if (!commandName)
        return loadAndShowCommands(interaction, guildId, user, data)

    if (commandName)
        data = data.find(d => d.id == commandName)

    if (
        !data
        || !data?.usage?.length
    )
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | Nenhum histórico do comando \`${commandName}\` foi encontrado.`.limit('MessageContent')
        }).catch(() => { })

    if (guildId && user) data.usage.filter(d => d.guildId == guildId && d.userId == user?.id)
    if (guildId) data.usage = data.usage.filter(d => d.guildId == guildId)
    if (user) data.usage = data.usage.filter(d => d.userId == user?.id)

    if (!data.usage.length)
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | Nenhum histórico do comando \`${commandName}\` com filtro foi encontrado.`.limit('MessageContent')
        }).catch(() => { })

    const embeds = []
    let pages = 1

    for (let i = 0; i < data.usage.length; i += 5) {

        const registers = data.usage.slice(i, i + 5)
        if (!registers.length) break;

        const embed = {
            color: client.blue,
            title: `Command Usage History - ${commandName} - Page ${pages}`,
            description: registers
                .map(d => `Server: \`${d.guildId || 0}\`\nUser: \`${d.userId || 0}\`\nChannel: \`${d.channelId || 0}\`\nTipo: \`${d.type || 0}\`\nData: ${time(d.date, 'f')}`)
                .join('\n-------------\n'),
            fields: [{
                name: `${e.Upvote} Usos`,
                value: `**${data.usage.length}** registros encontrados do comando **/${commandName}**.`
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

    const buttonData = [
        { emoji: '⏮️', id: 'zero' },
        { emoji: '◀️', id: 'back' },
        { emoji: '▶️', id: 'next' },
        { emoji: '⏭️', id: 'last' },
        { emoji: e.DenyX, id: 'cancel' }
    ]

    const components = [{
        type: 1,
        components: buttonData.map(({ emoji, id: custom_id }, i) => ({
            type: 2,
            emoji,
            custom_id,
            style: i == buttonData.length - 1 ? ButtonStyle.Danger : ButtonStyle.Primary,
            disabled: i == buttonData.length - 1 ? false : embeds.length == 1
        }))
    }]

    await interaction.editReply({ content: null, embeds: [embeds[0]], components }).catch(() => { })

    let index = 0
    const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        idle: 1000 * 60 * 2,
    })
        .on('collect', async int => {

            const { customId } = int

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
}