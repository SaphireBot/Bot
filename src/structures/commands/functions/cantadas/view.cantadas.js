import { SaphireClient as client } from "../../../../classes/index.js";
import { ButtonStyle } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";
import deleteCantada from "../../../classes/buttons/cantadas/delete.cantada.js";
import cantadaAdmin from "../../slashCommands/admin/functions/admin/cantada.admin.js";

export default async ({ interaction, buttonInteraction, clientData, commandData, search }) => {

    let option = undefined
    let cId = interaction?.message?.embeds[0]?.data?.footer?.text

    if (!buttonInteraction) {
        option = interaction.options.getString('opcoes')
        cId = interaction?.message?.embeds[0]?.data?.footer?.text || interaction.options.getString('search')

        if (['analise', 'delete'].includes(option))
            return cantadaAdmin(interaction, null, clientData.CantadasIndicadas, option, cId)
    }

    if (!client.cantadas.length)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma cantada encontrada.`,
            ephemeral: true
        })

    const mycantada = commandData?.mc || option === 'mycantadas'
    const cantadasAvailable = mycantada
        ? client.cantadas.filter(c => c.userId === interaction.user.id)
        : client.cantadas.filter(c => c.id !== cId)

    let cantada = search
        ? client.cantadas.find(c => c.id === search)
        : cantadasAvailable?.random()

    if (!cantada || !cantadasAvailable || !cantadasAvailable.length)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma cantada foi encontrada.`,
            components: [],
            ephemeral: true
        }).catch(() => { })
            .catch(async () => await interaction?.update({
                content: `${e.Deny} | Nenhuma cantada foi encontrada.`,
                components: []
            }))

    if (!cantada?.phrase || !cantada?.userId || !cantada?.acceptedFor)
        return deleteCantada(interaction, null, cantada?.id, interaction.message, true)

    const author = await client.users.fetch(cantada?.userId || '0')
        .then(u => `${u.username} - \`${u.id}\``)
        .catch(() => `Not Found - \`${cantada?.userId}\``)

    const acceptedFor = await client.users.fetch(cantada?.acceptedFor || '0')
        .then(u => `${u.username} - \`${u.id}\``)
        .catch(() => `Not Found - \`${cantada?.acceptedFor}\``)

    const embed = {
        color: client.blue,
        title: `😗 ${client.user.username}'s Cantadas - ${cantadasAvailable.findIndex(c => c.id === cantada?.id) + 1}/${cantadasAvailable.length}`,
        description: cantada?.phrase,
        fields: [
            {
                name: '📝 Escrita por',
                value: author
            },
            {
                name: `${e.ModShield} Autorizado por`,
                value: acceptedFor
            }
        ],
        footer: {
            text: cantada?.id
        }
    }

    const components = [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    label: `${cantada?.likes?.up?.length || 0}`,
                    emoji: '❤️‍🔥',
                    custom_id: JSON.stringify({ c: 'cantada', src: 'like', id: cantada?.id, mc: mycantada }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: `${cantada?.likes?.down?.length || 0}`,
                    emoji: '🖤',
                    custom_id: JSON.stringify({ c: 'cantada', src: 'unlike', id: cantada?.id, mc: mycantada }),
                    style: ButtonStyle.Danger
                },
                {
                    type: 2,
                    emoji: '🔄',
                    custom_id: JSON.stringify({ c: 'cantada', src: 'random', userId: interaction.user.id, mc: mycantada }),
                    style: ButtonStyle.Primary,
                    disabled: client.cantadas.length <= 1
                },
                {
                    type: 2,
                    emoji: '📨',
                    custom_id: JSON.stringify({ c: 'cantada', src: 'modal' }),
                    style: ButtonStyle.Primary
                }
            ]
        }
    ]

    const data = {
        embeds: [embed],
        components
    }

    return buttonInteraction
        ? await interaction.update(data)
        : await interaction.reply(data)
}