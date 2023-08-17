import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, guildData, giveawayId = false) => {

    const { options, guild, user } = interaction
    const gwId = giveawayId || options.getString('select_giveaway')
    const giveaway = guildData?.Giveaways?.find(gw => gw?.MessageID === gwId)

    if (!giveaway)
        return interaction.reply({ content: `${e.Deny} | Nenhum sorteio foi encontrado.`, ephemeral: true })

    const channel = await guild.channels.fetch(giveaway.ChannelId || '0').catch(() => null)
    const message = await channel?.messages.fetch(gwId || '0').catch(() => { })
    const embed = message?.embeds[0]?.data
    const requires = embed?.fields?.find(field => field?.name == `${e.Commands} Requisitos`)?.value
    const reaction = message?.reactions?.cache?.get(giveaway.Emoji)

    const fields = [
        {
            name: '🗺️ Localidade',
            value: `Sorteio registrado no canal ${channel || `Not Found - \`${giveaway.ChannelId}\``} em ${guild.name}`
        },
        {
            name: `${e.Info} Informações Gerais`,
            value: `Este sorteio foi criado por <@${giveaway.CreatedBy}> \`${giveaway.CreatedBy}\`.\nGanhou o **emoji** ${reaction?.emoji || giveaway.Emoji} e conta com **${giveaway.Winners} ${giveaway.Winners > 1 ? 'vencedores' : 'vencedor(a)'}**${giveaway.Actived ? `\nNeste momento, este sorteio tem **${((reaction?.count || 0)) > 1 ? `${reaction?.count - 1} participantes` : '0 participantes'}**` : ''}`
        },
        {
            name: '⏱️ Tempo',
            value: `Ele foi criado no dia ${Date.complete(giveaway.DateNow)}\ne ${giveaway.Actived ? 'tem' : 'teve'} exatos \`${Date.stringDate(giveaway.TimeMs)}\` para os membros participarem.\n \nEste sorteio ${giveaway.Actived ? 'será' : 'foi'} sorteado precisamente no dia ${Date.complete(giveaway.DateNow + giveaway.TimeMs)}`
        },
        {
            name: '📝 Prêmio',
            value: `${giveaway.Prize || "WTF? Nada aqui?"}`
        }
    ]

    if (requires)
        fields.push({
            name: `${e.Commands} Requisitos`,
            value: requires || `${e.SaphireWhat} Era pra ter alguma coisa aqui...`
        })

    if (giveaway.WinnersGiveaway)
        fields.push({
            name: `👑 ${giveaway.WinnersGiveaway.length} Vencedor${giveaway.WinnersGiveaway.length > 1 ? 'es' : '(a)'} e ${giveaway.Participants.length} Participante${giveaway.Participants.length > 1 ? 's' : ''}`,
            value: `${giveaway.WinnersGiveaway.map(id => `<@${id}>`).join(', ')}`
        })

    const components = [{
        type: 1,
        components: [{
            type: 3,
            custom_id: 'giveaway',
            placeholder: 'Opções disponíveis para este sorteio',
            options: [
                {
                    label: 'Deletar',
                    emoji: e.Trash,
                    description: 'Apague este sorteio da história da humanidade',
                    value: JSON.stringify({ c: 'giveaway', src: 'delete', gwId })
                },
                {
                    label: 'Excluir Mensagem',
                    emoji: e.Check,
                    description: 'Ao clicar aqui, esta mensagem irá sumir misteriosamente',
                    value: JSON.stringify({ c: 'delete' })
                },
            ]
        }]
    }]

    if (giveaway.Actived)
        components[0]
            .components[0]
            .options
            .splice(1, 0,
                {
                    label: 'Finalizar',
                    emoji: '📨',
                    description: 'Sortear este sorteio imediatamente',
                    value: JSON.stringify({ c: 'giveaway', src: 'finish', gwId })
                },
                {
                    label: 'Resetar',
                    emoji: '🔄',
                    description: 'Comece este sorteio do começo (literalmente)',
                    value: JSON.stringify({ c: 'giveaway', src: 'reset', gwId })
                }
            )
    else components[0]
        .components[0]
        .options
        .splice(1, 0,
            {
                label: 'Reroll',
                emoji: e.Tada,
                description: 'Resorteie novamente o sorteio',
                value: JSON.stringify({ c: 'giveaway', src: 'reroll', gwId })
            }
        )

    return interaction.reply({
        embeds: [{
            color: client.blue,
            title: `🔍 ${client.user.username}'s Giveaway Info`,
            url: giveaway.MessageLink,
            description: `Informações do sorteio \`${giveaway.MessageID}\``,
            fields,
            image: {
                url: embed?.image?.url ? embed?.image?.url : null
            },
            footer: {
                text: user.id
            }
        }],
        components
    })
}