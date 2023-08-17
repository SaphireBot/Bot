import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { parseEmoji } from "discord.js"
import { socket } from "../../../../websocket/websocket.js"
import { Config as config } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, customId) => {

    const { user, message, guild } = interaction
    const { embeds } = message
    const embed = embeds[0]?.data

    if (!embed)
        return interaction.update({
            content: `${e.Deny} | Embed não encontrada.`,
            components: []
        }).catch(() => { })

    if (user.id !== embed.footer.text) return

    if (customId === 'cancel')
        return message.delete().catch(() => { })

    const channelExist = await fetch(
        `https://discord.com/api/v10/channels/${config.animeSuggetionsChannel}`,
        {
            headers: { authorization: `Bot ${process.env.DISCORD_TOKEN}` },
            method: "GET"
        }
    )
        .then(async data => {
            const channelData = await data.json()
            return channelData?.id == config.animeSuggetionsChannel
        })
        .catch(() => null)

    if (!channelExist)
        return interaction.reply({
            content: `${e.Deny} | Canal de sugestões de animes não encontrado.`,
            ephemeral: true
        })

    const allAnimes = await Database.animeIndications() || []
    const animeName = embed.fields[0]?.value
    const alreadyExist = allAnimes.find(anime => anime?.name?.toLowerCase() === animeName?.toLowerCase())

    if (alreadyExist)
        return interaction.update({
            content: `${e.Deny} | O anime \`${animeName}\` já existe no banco de dados.`,
            components: [],
            embed: []
        }).catch(() => { })

    embed.fields.push({
        name: '👤 Autor(a)',
        value: `${client.users.resolve(embed.footer.text)?.username || 'Not Found'} - \`${embed.footer.text}\``
    })

    embed.fields.push({
        name: 'Guild Id Weebhook Control',
        value: guild.id
    })

    const selectMenuObject = {
        type: 1,
        components: [{
            type: 3,
            custom_id: 'animeSuggestions',
            placeholder: 'Admin Options',
            options: [
                {
                    label: 'Aceitar sugestão',
                    emoji: parseEmoji(e.Check),
                    description: 'Salvar esta sugestão no banco de dados',
                    value: 'accept',
                },
                {
                    label: 'Recusar sugestão',
                    emoji: parseEmoji(e.Deny),
                    description: 'Recusar e deletar esta sugestão',
                    value: 'deny'
                },
                {
                    label: 'Verificar Informações',
                    emoji: parseEmoji('🔎'),
                    description: 'Verificar informações do anime recomendado',
                    value: 'info'
                },
                {
                    label: 'Editar nome do anime',
                    emoji: parseEmoji('✍'),
                    description: 'Corrigir o nome do anime',
                    value: 'edit'
                }
            ]
        }]
    }

    if (embed.fields[3].value.includes(e.Loading))
        embed.fields.splice(3, 1)

    if (embed.fields[2].value.includes(e.Loading))
        embed.fields.splice(2, 1)

    await interaction.update({ content: `${e.Loading} | Enviando sugestão...`, components: [], embeds: [] }).catch(() => { })

    const sended = await socket
        .timeout(5000)
        .emitWithAck("postMessageWithReply", { channelId: config.animeSuggetionsChannel, embeds: [embed], components: [selectMenuObject] })
        .catch(() => null)

    embed.color = client.green
    embed.fields[embed.fields.length - 1] = {
        name: `🛰 Global System Notification`,
        value: `Este comando é integrado com o GSN *(Sistema Global de Notificação)*.\nVocê será notificado aqui no servidor se o sistema \`/logs\` estiver ativado.\n*Lembrando, se os Adm's do servidor privou o canal de logs, você não será notificado.*`
    }

    return sended
        ? interaction.editReply({
            content: `${e.Check} | Sua sugestão foi enviada com sucesso!`,
            embeds: [embed],
            components: []
        }).catch(() => { })
        : (() => {
            embed.color = client.red
            return interaction.editReply({
                content: `${e.Deny} | Não foi possível completar o envio. ~Motivo: Desconhecido`,
                embeds: [embed],
                components: []
            }).catch(() => { })
        })()

}