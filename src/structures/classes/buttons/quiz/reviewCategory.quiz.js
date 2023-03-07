import Quiz from "../../../../classes/games/Quiz.js";
import { ButtonStyle } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem analisar as categorias indicadas.`,
            ephemeral: true
        })

    const indications = Quiz.CategoriesIndications || []

    if (!indications.length)
        return await interaction.reply({
            content: `${e.Deny} | Não tem nenhuma sugestão aqui`,
            ephemeral: true
        })

    const indication = indications[0]

    if (!indication)
        return await interaction.reply({ content: `${e.Deny} | Indicação não encontrada.` })

    const user = await client.users.fetch(indication?.userId).catch(() => null)
    const guild = await client.guilds.fetch(indication?.guildId).catch(() => null)

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: "🔎 Análise de Categorias",
            fields: [
                {
                    name: "📌 Localização",
                    value: `👤 ${user?.tag || "Not Found"} - \`${user?.id || indication?.userId}\`\n🏦 ${guild?.name || "Not Found"} - \`${guild?.id || indication?.guildId}\``
                },
                {
                    name: "🏷️ Categoria",
                    value: indication?.category || "Not Found"
                },
                {
                    name: "📝 Motivo",
                    value: indication?.reason || "Not Found"
                },
                {
                    name: "🛰️ Global System Notification",
                    value: indication?.weebhookUrl ? "Ativado" : "Desativado"
                }
            ],
            footer: {
                text: `${indications.length - 1} indicações restantes`
            }
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Aceitar',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'acceptCategory' }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Recusar',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'denyCategory' }),
                    style: ButtonStyle.Danger
                }
            ]
        }]
    })
        .catch(async err => {
            return await interaction.reply({
                content: `${e.Deny} | Erro ao carregar a indicação.\n${e.bug} | \`${err}\``,
                embeds: [], components: []
            })
        })

}