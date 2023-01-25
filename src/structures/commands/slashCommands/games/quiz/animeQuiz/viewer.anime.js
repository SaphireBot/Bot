import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client
} from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default async (interaction, value) => {

    const allAnimes = client.animes || []
    const anime = allAnimes.find(an => an.id == value)

    if (!anime)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum anime foi encontrado.`,
            ephemeral: true
        })

    const acceptedFor = await client.users.fetch(anime.acceptedFor || "0")
        .then(u => `${u.tag} - \`${u.id}\``)
        .catch(() => `Not Found - \`${anime.acceptedFor}\``)

    const sendedFor = await client.users.fetch(anime.sendedFor || "0")
        .catch(() => `Not Found - \`${anime.sendedFor}\``)

    const type = {
        anime: 'Anime',
        male: 'Personagem Masculino',
        female: 'Personagem Feminino',
        others: 'Outros'
    }[anime.type] || 'Não identificado'

    const fields = [{ name: '📝 Tipo do Elemento', value: type }]

    if (anime.type !== 'anime')
        fields.push({
            name: '⭐ Nome do Personagem/Anime',
            value: `**${anime.name || "? Not Identified"}** do anime **${anime.anime || "? Not Identified"}**`
        })
    else fields.push({ name: '⭐ Nome do Anime', value: anime.anime || "? Not Identified" })

    fields.push({ name: '👤 Enviado por', value: sendedFor?.tag ? `${sendedFor.tag} - \`${sendedFor.id}\`` : sendedFor })

    const embed = {
        color: client.blue,
        title: '🔍 Suggestion Quiz Viewer',
        description: `O ID desta sugestão é \`${anime.id}\` e foi aceito por ${acceptedFor}`,
        fields,
        image: { url: anime.imageUrl || null },
        footer: {
            text: `Este usuário possui `
        }
    }

    if (sendedFor?.tag)
        embed.footer = {
            text: `📨 ${sendedFor.tag} possui ${allAnimes?.filter(an => an.sendedFor == anime.sendedFor)?.length || 0} sugestões aceitas`
        }

    const components = []

    if (client.staff.includes(interaction.user.id))
        components.push({
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Editar',
                    emoji: '📝',
                    custom_id: JSON.stringify({ c: 'animeQuiz', src: 'edit', srcAdd: 'edit', id: anime.id }),
                    style: ButtonStyle.Secondary
                },
                {
                    type: 2,
                    label: 'Excluir',
                    emoji: e.Trash,
                    custom_id: JSON.stringify({ c: 'animeQuiz', src: 'delete', id: anime.id }),
                    style: ButtonStyle.Danger
                },
                {
                    type: 2,
                    label: 'Deletar Mensagem',
                    custom_id: JSON.stringify({ c: 'delete' }),
                    style: ButtonStyle.Primary
                }
            ]
        })

    return await interaction.reply({ embeds: [embed], components })
}