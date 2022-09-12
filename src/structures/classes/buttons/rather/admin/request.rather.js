import { ButtonStyle } from "discord.js"
import { Config } from "../../../../../util/Constants.js"

export default async ({ interaction, e, client, embed, message }) => {

    const channel = await client.channels.fetch(Config.vocePrefereChannel).catch(() => null)

    if (!channel)
        return await interaction.update({
            content: `${e.Deny} | Não foi possível contactar o canal de envio.`,
            embeds: [],
            components: []
        }).catch(() => { })

    return channel.send({
        embeds: [embed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: ButtonStyle.Success,
                        label: 'Aceitar',
                        custom_id: JSON.stringify({ c: 'redit', src: 'confirm' })
                    },
                    {
                        type: 2,
                        style: ButtonStyle.Danger,
                        label: 'Recusar',
                        custom_id: JSON.stringify({ c: 'redit', src: 'cancel' })
                    }
                ]
            }
        ]
    })
        .then(async () => {
            return await interaction.update({
                content: `${e.Check} | Solicitação enviada com sucesso. A Saphire's Team vai analizar a sua alteração. Você pode conferir suas perguntas usando \`/rather options questions:Minhas perguntas\` ou </rather options view:${message.interaction.id}>`,
                embeds: [],
                components: []
            }).catch(() => { })
        })
        .catch(async () => {
            return await interaction.update({
                content: `${e.Deny} | Não foi possível efetuar o envio da solicitação ao canal central.`,
                embeds: [],
                components: []
            }).catch(() => { })
        })

}