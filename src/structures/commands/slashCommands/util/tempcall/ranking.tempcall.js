import { ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import rankMember from './member.ranking.tempcall.js'

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { guild, user, channel, options } = interaction
    const guildData = await Database.Guild.findOne({ id: guild.id }, 'TempCall')

    if (guildData?.TempCall && !guildData?.TempCall?.enable)
        return interaction.reply({
            content: `${e.SaphireDesespero} | Ah não, o sistema de Tempo em Call está desativado.`,
            ephemeral: true
        })

    if (options.getMember('member')) return rankMember(interaction, guildData)

    const usersId = Array.from(new Set([Object.keys(guildData?.TempCall?.members || {}), Object.keys(guildData?.TempCall?.membersMuted || {})].flat()))

    if (!usersId?.length)
        return interaction.reply({
            content: `${e.cry} | Nenhum membro foi contabilizado para o ranking.`,
            ephemeral: true
        })

    if (!guildData.TempCall.members) guildData.TempCall.members = {}
    if (!guildData.TempCall.membersMuted) guildData.TempCall.membersMuted = {}

    await interaction.reply({ content: `${e.Loading} | Carregando ranking` })
    await guild.members.fetch()
    const data = usersId
        .map(userId => ({ member: guild.members.cache.get(userId), OnTime: guildData?.TempCall?.members[userId] || 0, offTime: guildData?.TempCall?.membersMuted[userId] || 0 }))
        .filter(d => d.member)
        .sort((a, b) => b.OnTime - a.OnTime)
        .map((d, i) => {
            return `${emojiRanking(i)} ${d.member?.user?.tag || 'Not Found'} \`${d.member?.id}\`\n🎙️ \`${Date.stringDate(d.OnTime, true)}\`\n🔇 \`${Date.stringDate(d.offTime, true)}\``
        })

    if (data.length <= 20)
        return interaction.editReply({
            content: null,
            embeds: [{
                color: client.blue,
                title: `🎙️ ${guild.name}'s Ranking Temp Voice System`,
                description: data.join('\n'),
                footer: {
                    text: `${data.length} Usuários registrados | Atualizado a cada 30 segundos`
                }
            }]
        })

    const embeds = EmbedGenerator(data)

    if (!embeds.length)
        return interaction.editReply({
            content: `${e.saphireDesespero} | Nenhuma embed foi encontrada.`
        })

    let index = 0

    const components = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Pra cá',
                emoji: e.saphireLeft,
                custom_id: 'back',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Pra lá',
                emoji: e.saphireRight,
                custom_id: 'foward',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Cancelar',
                emoji: e.Deny,
                custom_id: 'cancel',
                style: ButtonStyle.Danger
            }
        ]
    }

    const message = await interaction.editReply({
        content: null,
        embeds: [embeds[index]],
        components: [components]
    })
        .catch(() => null)

    if (!message)
        return interaction.followUp({
            content: `${e.Deny} | Mensagem não encontrada para a paginação.`,
            ephemeral: true
        })

    const collector = message.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 1000 * 60 * 5
    })
        .on('collect', int => {

            const { customId } = int

            if (customId == 'back') index = embeds[index - 1] ? index - 1 : embeds.length - 1
            if (customId == 'foward') index = embeds[index + 1] ? index + 1 : 0

            if (customId == 'cancel')
                return collector.stop()

            return int.update({ embeds: [embeds[index]] })
                .catch(() => { })
        })
        .on('end', (_, reason) => {

            embeds[index].color = client.red

            if (reason == 'user')
                client.pushMessage({
                    method: 'patch',
                    channelId: channel.id,
                    messageId: message.id,
                    body: {
                        embeds: [embeds[index]],
                        components: []
                    }
                })

            if (['limit', 'time', 'idle'].includes(reason)) {
                embeds[index].footer.text += " | Tempo Excedido"
                client.pushMessage({
                    method: 'patch',
                    channelId: channel.id,
                    messageId: message.id,
                    body: {
                        embeds: [embeds[index]],
                        components: []
                    }
                })
            }

            return

        })

    return

    function EmbedGenerator(array) {

        let amount = 10
        let page = 1
        let embeds = []
        let length = array.length / 10 <= 1 ? 1 : parseInt((array.length / 10) + 1)

        for (let i = 0; i < array.length; i += 10) {

            let current = array.slice(i, amount)
            let description = current.join('\n')
            let pageCount = length > 1 ? `${page}/${length}` : ''

            embeds.push({
                color: client.blue,
                title: `🎙️ ${guild.name}'s Ranking Temp Voice System ${pageCount}`,
                description,
                footer: {
                    text: `${data.length} Usuários registrados | Atualizado a cada  30 segundos`
                }
            })

            page++
            amount += 10

        }

        return embeds
    }

    function emojiRanking(i) {
        return {
            0: '🥇',
            1: '🥈',
            2: '🥉'
        }[i] || `${i + 1}. `
    }
}