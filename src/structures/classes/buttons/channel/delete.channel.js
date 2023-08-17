import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, { src, id }) => {

    const { guild, user, message } = interaction

    if (user.id !== message.interaction.user.id) return

    if (src === 'cancel')
        return await interaction.update({
            content: `${e.Deny} | Comando cancelado.`,
            components: []
        }).catch(() => { })

    const channel = guild.channels.cache.get(id)

    if (!channel)
        return await interaction.update({
            content: `${e.Deny} | Canal não encontrado.`,
            components: []
        }).catch(() => { })

    const fail = await channel.delete(`${user.username} solicitou a exclusão deste canal.`)
        .catch(err => err.code)

    if (fail.constructor === Number) {

        const content = {
            50074: `${e.Deny} | Não é possível deletar canais configurados na comunidade.`,
            10003: `${e.Deny} | Este canal é desconhecido. Por favor, tente em outro canal.`,
            50024: `${e.Deny} | Essa ação não pode ser executada nesse tipo de canal.`
        }[fail] || `${e.Deny} | Não foi possível deletar o canal ${channel}.`

        return await interaction.update({ content, components: [] }).catch(() => { })
    }

    if (!interaction.channel?.id || interaction.channel?.id === channel?.id) return
    return await interaction.update({
        content: `${e.Check} | O canal **${channel?.name}** foi deletado com sucesso.`,
        components: []
    }).catch(() => { })
}