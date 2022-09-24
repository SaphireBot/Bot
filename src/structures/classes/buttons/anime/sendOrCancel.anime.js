import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Config as config } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, customId) => {

    const { user, message } = interaction

    if (user.id !== message.interaction.user.id) return

    if (customId === 'cancel')
        return message.delete().catch(() => { })

    const channel = await client.channels.fetch(config.animeSuggetionsChannel).catch(() => null)

    if (!channel)
        return await interaction.reply({
            content: `${e.Deny} | Canal de sugestões de animes não encontrado.`,
            ephemeral: true
        })

    const { embeds } = message
    const embed = embeds[0]?.data

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Embed não encontrada.`,
            components: []
        }).catch(() => { })

    const allAnimes = await Database.animeIndications() || []
    const animeName = embed.fields[0]?.value
    const alreadyExist = allAnimes.find(anime => anime?.name?.toLowerCase() === animeName?.toLowerCase())

    if (alreadyExist)
        return await interaction.update({
            content: `${e.Deny} | O anime \`${animeName}\` já existe no banco de dados.`,
            components: [],
            embed: []
        }).catch(() => { })

    embed.fields.push({
        name: '👤 Autor(a)',
        value: `${client.users.resolve(embed.footer.text)?.tag || 'Not Found'} - \`${embed.footer.text}\``
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
                    emoji: e.Check,
                    description: 'Salvar esta sugestão no banco de dados do jogo',
                    value: 'accept',
                },
                {
                    label: 'Recusar sugestão',
                    emoji: e.Deny,
                    description: 'Recusar e deletar esta sugestão',
                    value: 'deny'
                },
                {
                    label: 'Editar nome do anime',
                    emoji: '✍',
                    description: 'Corrigir o nome do anime',
                    value: 'edit'
                }
            ]
        }]
    }

    const sended = await channel.send({ embeds: [embed], components: [selectMenuObject] }).catch(() => null)

    embed.color = client.green
    return sended
        ? await interaction.update({
            content: `${e.Check} | Sua sugestão foi enviada com sucesso!`,
            embeds: [embed],
            components: []
        }).catch(() => { })
        : (async () => {
            embed.color = client.red
            await interaction.update({
                content: `${e.Deny} | Não foi possível completar o envio. ~Motivo: Desconhecido`,
                embeds: [embed],
                components: []
            }).catch(() => { })
        })()

}