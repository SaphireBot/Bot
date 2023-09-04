import { ChatInputCommandInteraction, Routes } from "discord.js";
import { SaphireClient as client, Database } from "../../../../../../classes/index.js";
import { Emojis as e } from "../../../../../../util/util.js";
import { socket } from "../../../../../../websocket/websocket.js";

/**
 *  @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { user, options } = interaction
    if (!client.staff.includes(user.id))
        return interaction.reply({ content: `${e.DenyX} | Acesso negado.`, ephemeral: true })

    const data = {
        id: options.getString("id"),
        type: options.getString("type"), // user | guild | economy
        addedAt: new Date(),
        staff: user.id,
        reason: {
            broke_rules: 'Quebrando regras da Saphire Moon',
            bugs_purposeful: 'Tentativa de bugs propositais',
            mocking_economy: 'Burlando o sistema de economia',
        }[options.getString("reason")] || options.getString("reason")
    }

    if (options.getInteger("time"))
        data.removeIn = new Date(Date.now() + options.getInteger("time"))

    await interaction.reply({
        content: `${e.Loading} | Adicionando ${['user', 'economy'].includes(data.type) ? 'usuário' : 'servidor'} a Blacklist...`
    })

    if (!socket?.connected)
        return interaction.editReply({
            content: `${e.DenyX} | Websocket está se reconectando ou perdeu a conexão com a API. Por favor, tente novamente.`
        }).catch(() => { })

    let target = "servidor"
    if (['user', 'economy'].includes(data.type)) {
        const get = await client.rest.get(Routes.user(data.id)).catch(() => null)
        if (!get) return interaction.editReply({ content: `${e.DenyX} | Usuário não encontrado.` }).catch(() => { })
        target = `${get.username} \`${data.id}\``
    }

    await Database.Blacklist.findOneAndUpdate(
        { id: data.id },
        { $set: { ...data } },
        { new: true, upsert: true }
    )
        .then(async () => {
            socket.send({ type: "refreshIDBlacklist", id: data.id })

            if (data.type == "guild") await client.rest.delete(Routes.guild(data.id)).catch(() => { })

            client.blacklist.set(data.id, data)
            return interaction.editReply({
                content: `${e.CheckV} | Adição do alvo "**${target}**" foi adicionado a blacklist.${data.type == 'guild' ? `\n${e.Info} | Por praticidade, eu vou saí do servidor, beleza?` : ''}`
            }).catch(() => { })
        })
        .catch(err => interaction.editReply({
            content: `${e.DenyX} | Falha na adição a Blacklist.\n${e.bug} | \`${err}\``
        }).catch(() => { }))

}