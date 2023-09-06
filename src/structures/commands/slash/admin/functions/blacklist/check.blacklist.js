import { SaphireClient as client, Database } from "../../../../../../classes/index.js";
import { ChatInputCommandInteraction, Routes, time } from "discord.js";
import { Emojis as e } from "../../../../../../util/util.js";

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { user, options } = interaction
    if (!client.staff.includes(user.id))
        return interaction.reply({ content: `${e.DenyX} | Acesso negado.` })

    const id = options.getString("target")

    await interaction.reply({ content: `${e.Loading} | Buscando dados...` })

    /**
     * @type { {
     *  addedAt: Date,
     *  reason: string,
     *  removeIn: Date | null,
     *  staff: string
     *  type: 'user' | 'guild' | 'economy'
     * } }
     */
    const data = client.blacklist.get(id) || await Database.Blacklist.findOne({ id }).catch(() => null)

    if (!data)
        return interaction.editReply({ content: `${e.Animated.SaphireReading} | Nenhum alvo foi encontrado na blacklist com o ID informado.` }).catch(() => { })

    if (data && !client.blacklist.has(id))
        client.blacklist.set(id, data)

    const target = ['user', 'economy'].includes(data.type)
        ? await client.rest.get(Routes.user(data.id)).then(user => `${user.username} - \`${data.id}\``).catch(() => `User Not Found - \`${data.id}\``)
        : `Servidor - \`${data.id}\``

    const staff = await client.rest.get(Routes.user(data.staff))
        .then(user => `${user.username} - \`${data.id}\``)
        .catch(() => `Staffer - \`${data.id}\``)

    const type = {
        user: "Usuário",
        guild: "Servidor",
        economy: "Economia"
    }[data.type] || "Desconhecido"

    return interaction.editReply({
        content: null,
        embeds: [
            {
                color: client.blue,
                title: `${client.user.username}'s Blacklist`,
                description: `🧩 Alvo: ${target}\n🏷️ Tipo: ${type}\n📅 Adicionado em: ${time(new Date(data.addedAt), "D")} às ${time(new Date(data.addedAt), 'T')} ${time(new Date(data.addedAt), "R")}\n📝 Razão: ${data.reason}\n👤 Staff: ${staff}\n⏱️ Remoção em: ${data.removeIn ? time(new Date(data.removeIn), 'D') + ' ás ' + time(new Date(data.removeIn), 'T') + ' ' + time(new Date(data.removeIn), "R") : 'Nunca'}`,
            }
        ]
    }).catch(() => { })

}