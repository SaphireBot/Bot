import { ButtonStyle } from "discord.js"

export default async ({ gameData, partyId, client, e, guild, interaction }, isComplete = false) => {

    if (!isComplete)
        if (gameData.host !== interaction.user.id)
            return await interaction.reply({
                content: `${e.Deny} | Apenas o Host <@${gameData.host}> pode iniciar a partida.`,
                ephemeral: true
            })

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: `${e.amongus} | Among Us Party | Playing`,
            description: 'Este é um comando técnico feito para ajudar os jogadores em partidas do jogo Among Us. Auxiliando nos mutes de um jeito fácil.',
            fields: [
                {
                    name: '🛰️ Tripulantes',
                    value: `${gameData.players.length
                        ? gameData.players
                            .map(id => `${e.amongusdance} ${guild.members.cache.get(id) || `<@${id}>`}`)
                            .join('\n')
                        : 'Ninguém vivo'}`.limit('MessageEmbedFieldValue')
                },
                {
                    name: '👻 Mortos',
                    value: `${gameData.deaths.length
                        ? gameData.deaths
                            .map(id => `${e.amongusdeath} ${guild.members.cache.get(id) || `<@${id}>`}}`)
                            .join('\n')
                        : 'Ninguém foi morto'}`.limit('MessageEmbedFieldValue')
                },
                {
                    name: `${e.Info} Status`,
                    value: `${e.Check} Partida Iniciada`
                }
            ]
        }],
        components: [
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
            },
            {
                type: 1,
                components: [
                    {
                        type: 3,
                        custom_id: `${JSON.stringify({ c: 'amongus', partyId })}`,
                        placeholder: 'Selecionar usuários mortos',
                        max_values: gameData.players.length,
                        min_values: 1,
                        options: [
                            ...gameData.players.map(id => ({
                                label: `${guild.members?.cache?.get(id)?.displayName || id}`,
                                emoji: e.amongusdance,
                                description: 'Vivo',
                                value: `${id}`
                            }))
                        ]
                    }
                ]
            }
        ]
    }).catch(() => { })
}