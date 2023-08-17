import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, channel) => {

    if (channel.nsfw)
        return await interaction.reply({
            content: `${e.Info} | O canal ${channel} já é um canal NSFW.`,
            ephemeral: true
        })

    const { user } = interaction

    const fail = await channel.setNSFW(true, `${user.username} ativou o NSFW.`)
        .catch(err => err.code)

    if (fail.constructor === Number) {

        const content = {
            10003: `${e.Deny} | Este canal é desconhecido. Por favor, tente em outro canal.`,
            50024: `${e.Deny} | Essa ação não pode ser executada nesse tipo de canal.`
        }[fail] || `${e.Deny} | Não foi possível ativar o NSFW no canal ${channel}.`

        return await interaction.reply({ content }).catch(() => { })
    }

    return await interaction.reply({
        content: `${e.Check} | Prontinho, agora o canal ${channel} é um lugar de pessoas erradas.`
    }).catch(() => { })
}