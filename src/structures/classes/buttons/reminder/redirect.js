import { ButtonInteraction } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";
import { Database, Modals } from "../../../../classes/index.js";
import { socket } from "../../../../websocket/websocket.js";

/**
 * @param { ButtonInteraction } interaction
 * @param { {
 *    c: "rmd"
 *    src: "snooze" | "revalidade"
 *    uId: string
 * } } customData
 */
export default async (interaction, customData) => {

    const { src, uId: userId } = customData
    const { user, message } = interaction

    if (userId !== user.id)
        return interaction.reply({
            content: `${e.Animated.SaphireReading} | Hey! Esse lembrete não é seu, sabia?`,
            ephemeral: true
        })

    if (!socket?.connected)
        return interaction.reply({ content: `${e.Animated.SaphirePanic} | A minha websocket não está conectada com a API, pode tentar de novo?`, components: [] }).catch(() => { })

    if (src == "revalidate") return interaction.showModal(Modals.reconfigureReminder(message.id, user.id))
    await interaction.update({ content: `${e.Loading} | Identificando lembrete...`, components: [] }).catch(() => { })

    const reminder = await Database.Reminder.findOne({ messageId: message?.id })

    if (!reminder)
        return interaction.editReply({
            content: `${e.DenyX} | Lembrete não encontrado no banco de dados.`,
            components: []
        }).catch(() => { })

    if (reminder?.deleteAt && (Date.now() >= reminder?.deleteAt)) {
        socket?.send({ type: "removeReminder", id: reminder.id })
        return interaction.editReply({
            content: `${e.Animated.SaphireReading} | Você demorou demais para responder este lembrete. Ele foi deletado.`,
            components: []
        }).catch(() => { })
    }

    if (src == "snooze") {

        await interaction.editReply({ content: `${e.Loading} | Adiando lembrete....` }).catch(() => { })

        const snoozed = await Database.Reminder.findOneAndUpdate(
            { messageId: message.id },
            {
                $set: {
                    Time: 1000 * 60 * 10,
                    DateNow: Date.now(),
                    snoozed: true,
                    Alerted: false
                }
            },
            { new: true }
        )
            .catch(() => false)

        if (!snoozed)
            return interaction.editReply({ content: `${e.Loading} | Não foi possível editar este lembrete.` }).catch(() => { })

        await interaction.editReply({ content: `${e.Loading} | Salvando lembrete....` }).catch(() => { })

        const res = await socket
            ?.timeout(3000)
            .emitWithAck("refreshReminder", snoozed.toObject())
            .catch(() => "Timeout")

        const content = {
            "Success": `${e.CheckV} | Ok, daqui a 10 minutos eu vou te lembrar novamente.`,
            "Timeout": `${e.DenyX} | Tempo de resposta da websocket excedido.`,
            "Not Found": `${e.DenyX} | Lembrete não encontrado ou mal formatado.`,
        }[res] || `${e.bug} | Resposta não enviada corretamente via Websocket. \`#16846574\``

        return interaction.editReply({ content }).catch(() => { })
    }

    return interaction.reply({ content: `${e.DenyX} | Nenhuma sub-função encontrada.`, ephemeral: true })
}