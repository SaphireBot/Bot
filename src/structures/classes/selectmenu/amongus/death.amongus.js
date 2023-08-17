import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import deleteParty from "../../buttons/amongus/delete.amongus.js"

export default async ({ interaction, customId: data }) => {

    const { user, guild, values } = interaction
    const partyId = data.partyId

    let gameData = await Database.Cache.AmongUs.get(partyId)
    if (!gameData)
        return await interaction.update({
            content: `${e.Deny} | Não foi possível localizar o jogo no banco de dados.`,
            embeds: [], components: []
        }).catch(() => { })

    if (gameData.host !== user.id)
        return await interaction.reply({
            content: `${e.Deny} | Apenas o Host <@${gameData.host}> pode selecionar os usuários mortos em partida.`,
            ephemeral: true
        })

    const channel = await guild.channels.fetch(gameData.channelId || "0").catch(() => { })
    if (!channel) {
        deleteGameData()
        return await interaction.update({
            content: `${e.Deny} | Eu não achei o canal de voz configurado no jogo \`${partyId}\`.`,
            embeds: [], components: []
        }).catch(() => { })
    }

    if (channel.members.size < 4) {
        deleteParty(partyId)
        return await interaction.update({
            content: `${e.Deny} | O canal tem menos de 4 pessoas. Jogo cancelado.`,
            embeds: [], components: []
        }).catch(() => { })
    }

    const toRevive = []
    const toKill = []
    const outOfCall = []

    for (let i of values) {

        if (!channel.members.get(i)) {
            outOfCall.push(i)
            continue
        }

        if (gameData.deaths.includes(i))
            toRevive.push(i)
        else toKill.push(i)
    }

    await Database.Cache.AmongUs.pull(`${partyId}.players`, (i) => toKill.includes(i) || outOfCall.includes(i))
    await Database.Cache.AmongUs.push(`${partyId}.deaths`, toKill)

    await Database.Cache.AmongUs.pull(`${partyId}.deaths`, (i) => toRevive.includes(i) || outOfCall.includes(i))
    gameData = await Database.Cache.AmongUs.push(`${partyId}.players`, toRevive)

    const { message } = interaction
    const embed = message.embeds[0].data

    if (!embed) {
        deleteParty(partyId)
        return await interaction.update({
            content: `${e.Deny} | Embed não localizada.`,
            components: []
        })
    }

    embed.fields[0].value = `${gameData.players.length
        ? gameData.players.map(id => `${e.amongusdance} ${guild.members.cache.get(id) || `<@${id}>`}`)
            .join('\n')
        : 'Ninguém vivo'}`.limit('MessageEmbedFieldValue')

    embed.fields[1].value = `${gameData.deaths.length
        ? gameData.deaths.map(id => `${e.amongusdeath} ${guild.members.cache.get(id) || `<@${id}>`}`)
            .join('\n')
        : 'Ninguém foi morto'}`.limit('MessageEmbedFieldValue')

    return await interaction.update({
        embeds: [embed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 3,
                        custom_id: `${JSON.stringify({ c: 'amongus', partyId })}`,
                        placeholder: 'Selecionar usuários mortos',
                        max_values: [...gameData.players, ...gameData.deaths].length,
                        min_values: 1,
                        options: [
                            ...[...gameData.players, ...gameData.deaths].map(id => ({
                                label: `${guild.members?.cache?.get(id)?.displayName || client.users.resolve(id)?.username || id}`,
                                emoji: gameData.players.includes(id) ? e.amongusdance : e.amongusdeath,
                                description: gameData.players.includes(id)
                                    ? 'Vivo'
                                    : gameData.deaths.includes(id)
                                        ? 'Morto'
                                        : 'Estado indefinido',
                                value: `${id}`,
                            }))
                        ]
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Mutar',
                        emoji: '🔇',
                        custom_id: JSON.stringify({ c: 'amongus', src: 'mute', partyId }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Desmutar',
                        emoji: '🔊',
                        custom_id: JSON.stringify({ c: 'amongus', src: 'unmute', partyId }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Reiniciar',
                        emoji: '🔄',
                        custom_id: JSON.stringify({ c: 'amongus', src: 'restart', partyId }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        emoji: '✖️',
                        custom_id: JSON.stringify({ c: 'amongus', src: 'cancel', partyId }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })

    async function deleteGameData() {
        await Database.Cache.AmongUs.delete(partyId)
    }
}