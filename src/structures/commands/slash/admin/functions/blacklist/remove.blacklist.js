import { SaphireClient as client, Database } from "../../../../../../classes/index.js";
import { ChatInputCommandInteraction } from "discord.js";
import { Emojis as e } from "../../../../../../util/util.js";
import { socket } from "../../../../../../websocket/websocket.js";

/**
 *  @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { user, options } = interaction
    if (!client.staff.includes(user.id))
        return interaction.reply({ content: `${e.DenyX} | Acesso negado.`, ephemeral: true })

    const id = options.getString("target")

    if (!id)
        return interaction.reply({ content: `$${e.DenyX} | Nenhum ID foi fornecido.`, ephemeral: true })

    await interaction.reply({ content: `${e.Loading} | Removendo usuário da blacklist...` })

    if (!socket?.connected)
        return interaction.editReply({
            content: `${e.DenyX} | Websocket está se reconectando ou perdeu a conexão com a API. Por favor, tente novamente.`
        }).catch(() => { })

    return await Database.Blacklist.deleteMany({ id })
        .then(doc => {
            socket.send({ type: "clearIDBlacklist", id })
            return interaction.editReply({
                content: `${e.Info} | ${doc.deletedCount} alvos removidos da blacklist.`
            }).catch(() => { })
        })
        .catch(err => interaction.editReply({ content: `${e.DenyX} | Erro ao remover o alvo da blacklist.\n${e.bug} | \`${err}\`` }).catch(() => { }))
}