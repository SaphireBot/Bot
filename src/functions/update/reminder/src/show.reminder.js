import { Routes } from "discord.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { socket } from "../../../../websocket/websocket.js"
const intervals = {
    0: 'Disparo Único',
    1: 'Diariamente',
    2: 'Semanalmente',
    3: 'Mensal'
}

export default async (interaction, reminderId, toEdit, reminder) => {

    if (!reminderId) return

    const data = reminder || await socket?.timeout(1000)?.emitWithAck("getReminder", reminderId).catch(() => null)

    if (!data)
        return interaction.reply({
            content: `${e.Deny} | Lembrete não encontrado.`,
            ephemeral: true
        })

    let guild = await client.guilds.fetch(data.guildId).then(g => g?.name ? `${g?.name || '\`Not Found\`'} - \`${data.guildId}\`` : false).catch(() => false)

    if (!guild)
        guild = await client.rest.get(Routes.guild(data.guildId)).then(g => g?.name ? `${g?.name || '\`Not Found\`'} - \`${data.guildId}\`` : `\`Guild Not Found\` - \`${data.guildId}\``).catch(() => `\`Guild Not Found\` - \`${data.guildId}\``)

    const responseData = {
        embeds: [{
            color: client.blue,
            title: '🔍 Lembrete Viewer',
            description: `O ID deste lembrete é \`${data.id}\``,
            fields: [
                {
                    name: '🗺️ Local de Disparo',
                    value: `Canal <#${data.ChannelId}> \`${data.ChannelId}\`\nServidor **${guild}**`
                },
                {
                    name: '📝 Mensagem',
                    value: data.RemindMessage.limit("MessageEmbedFieldValue") || 'Sem mensagem definida'
                },
                {
                    name: '⏳ Intervalo',
                    value: intervals[data.interval || 0]
                },
                {
                    name: '⏱️ Tempo Definido',
                    value: `${Date.GetTimeout(data.Time, data.DateNow, 'f')} (${Date.GetTimeout(data.Time, data.DateNow, 'R')})\n${data.Alerted ? 'Este lembrete já foi disparado' : 'Este lembrete não foi disparado'}${data.snoozed ? "\nLembrete adiado" : ""}`
                }
            ]
        }],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'reminder',
                placeholder: 'Funções do Lembrete',
                options: [
                    {
                        label: 'Editar',
                        emoji: '📝',
                        description: 'Edite a mensagem e a hora que você definiu',
                        value: JSON.stringify({ c: 'edit', reminderId })
                    },
                    {
                        label: 'Deletar',
                        emoji: e.Trash,
                        description: 'Delete para sempre o lembrete',
                        value: JSON.stringify({ c: 'delete', reminderId })
                    },
                    {
                        label: 'Mover lembrete para este canal',
                        emoji: '🗺️',
                        description: 'Definir que o lembrete seja disparado aqui',
                        value: JSON.stringify({ c: 'move', reminderId })
                    }
                ]
            }]
        }],
        ephemeral: true
    }

    return toEdit
        ? interaction.update(responseData).catch(() => { })
        : interaction.reply(responseData)
}