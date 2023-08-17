import { ButtonStyle } from "discord.js"

export default async ({ partyData, user, e, interaction, Database, client, channel, partyId, gameData }) => {

    if (partyData.host !== user.id)
        return await interaction.reply({
            content: `${e.Deny} | Apenas o Host <@${partyData.host}> pode reiniciar este jogo.`,
            ephemeral: true
        })

    const members = channel.members.filter(member =>
        [...gameData.players, ...gameData.deaths].includes(member.id)
        && member.voice.serverMute
    )
    members.forEach(async member => {
        member.voice.setMute(false, 'Among Us Party Restart')
        await unregisterMute(member.id)
    })

    await Database.Cache.AmongUs.set(partyId, {
        host: user.id,
        channelId: channel.id,
        players: [],
        deaths: [],
        invite: gameData.invite,
        inMute: gameData.inMute
    })

    interaction.message.delete().catch(() => { })
    await interaction.reply({
        embeds: [{
            color: client.blue,
            title: `${e.amongus} | Among Us Party | Starting`,
            description: 'Este é um comando técnico feito para ajudar os jogadores em partidas do jogo Among Us. Auxiliando nos mutes de um jeito fácil.',
            fields: [
                {
                    name: '👥 Jogadores',
                    value: `${channel.members.map(m => `${e.Loading} | ${m}`).join('\n')}`.limit('MessageEmbedFieldValue')
                },
                {
                    name: '👻 Mortos',
                    value: 'Ninguém morreu ainda'
                },
                {
                    name: `${e.Info} Status`,
                    value: `Esperando confirmação de pelo menos 4 jogadores.`
                }
            ],
            footer: {
                text: `Party: ${partyId}`
            }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Participar',
                        custom_id: JSON.stringify({ c: 'amongus', src: 'join', partyId }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Sair',
                        custom_id: JSON.stringify({ c: 'amongus', src: 'leave', partyId }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        custom_id: JSON.stringify({ c: 'amongus', src: 'cancel', partyId }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })

    if (gameData.inMute.length)
        return await interaction.channel.send({
            content: `${e.Animated.SaphirePanic} | A NÃÃÃO, ${gameData.inMute.map(id => `<@${id}>`).join(', ')} saiu da call e continua mutado. Alguém desmuta ele aí por favor.`
        })

    return

    async function unregisterMute(userId) {
        await Database.Cache.AmongUs.pull(`${partyId}.inMute`, userId)
    }
}