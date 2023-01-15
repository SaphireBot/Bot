import { ButtonStyle } from "discord.js"
import startAmongus from "./start.amongus.js"

export default async ({ interaction, channel, user, e, partyData, Database, client, partyId, guild }) => {

    if (!channel.members.map(m => m.id).includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Você tem que estar no canal ${channel} para poder entrar no jogo.`,
            ephemeral: true
        })

    if (partyData.players?.includes(user.id))
        return await interaction.reply({
            content: `${e.Check} | Você já entrou na partida.`,
            ephemeral: true
        })

    const players = []

    for (let i of [...partyData.players, user.id])
        if (channel.members.has(i))
            players.push(i)

    const gameData = await Database.Cache.AmongUs.set(`${partyId}.players`, players)

    if (gameData.players.length >= 15)
        return startAmongus({ client, e, gameData, guild, interaction, partyId }, true)

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: `${e.amongus} | Among Us Party | Starting`,
            description: 'Este é um comando técnico feito para ajudar os jogadores em partidas do jogo Among Us. Auxiliando nos mutes de um jeito fácil.',
            fields: [
                {
                    name: '👥 Jogadores',
                    value: `${channel.members.map(m => `${gameData?.players?.includes(m.id) ? e.amongusdance : e.Loading} | ${m}`)
                        .join('\n')}`
                        .limit('MessageEmbedFieldValue')
                },
                {
                    name: '👻 Mortos',
                    value: 'Ninguém morreu ainda'
                },
                {
                    name: `${e.Info} Status`,
                    value: 4 - gameData?.players.length > 0
                        ? `Esperando confirmação de pelo menos 4 jogadores.`
                        : `Esperando <@${partyData.host}> iniciar a partida.`
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
                        label: 4 - gameData?.players.length > 0
                            ? `Falta ${4 - gameData?.players.length} jogadores`
                            : 'Iniciar',
                        custom_id: JSON.stringify({ c: 'amongus', src: 'init', partyId }),
                        style: ButtonStyle.Success,
                        disabled: gameData.players.length < 4
                    },
                    {
                        type: 2,
                        label: 'Copiar código',
                        custom_id: JSON.stringify({ c: 'amongus', src: 'copy', partyId }),
                        style: ButtonStyle.Secondary
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
    }).catch(() => { })
}