import { PermissionsBitField, StringSelectMenuInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database, SaphireClient as client } from "../../../../classes/index.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { 'punishment' | 'days' } src
 */
export default async (interaction, value, src) => {

    const { member, guildId, message } = interaction

    if (!member.permissions.has(PermissionsBitField.Flags.KickMembers, true))
        return interaction.reply({
            content: `${e.DenyX} | Você não pode clicar aqui, sai fora.`,
            ephemeral: true
        })

    const components = message.components
    await interaction.update({ content: `${e.Loading} | Salvando alterações...`, components: [] })

    const punishment = (punish) => {
        return {
            ban: 'Banimento (ban)',
            kick: 'Expulsão (kick)',
            warn: 'Aviso no canal de logs'
        }[punish] || 'Nenhuma punição definida'
    }

    if (value == 'disable') return disableMinDay()
    return src == 'days' ? setDays() : setPunishment()

    async function setDays() {

        return await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $set: { 'MinDay.days': Number(value) } },
            { upsert: true, new: true }
        )
            .then(data => {
                Database.saveGuildCache(data?.id, data)
                return interaction.editReply({
                    content: null,
                    embeds: [{
                        color: client.blue,
                        title: `${e.Animated.SaphireReading} MinDay System Control`,
                        description: 'O MinDay é um sistema que controla a entrada de usuários no servidor.\nUsuários com menos de X Dias de conta criada pode ser expulso ou banido.\n*Este sistema é integrado com o GSN, você pode ativar os logs usando o comando \`/logs\`',
                        fields: [
                            {
                                name: '🗓️ Dias Configurados',
                                value: data?.MinDay?.days
                                    ? `${data?.MinDay?.days} dias`
                                    : 'Nenhum dia foi configurado'
                            },
                            {
                                name: '🔨 Punição',
                                value: punishment(data?.MinDay?.punishment)
                            }
                        ]
                    }],
                    components
                })
            })

    }

    async function disableMinDay() {

        await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $unset: { MinDay: true } },
            { upsert: true, new: true }
        )
            .then(data => {
                Database.saveGuildCache(data?.id, data)
                return interaction.editReply({
                    content: null,
                    embeds: [{
                        color: client.blue,
                        title: `${e.Animated.SaphireReading} MinDay System Control`,
                        description: 'O MinDay é um sistema que controla a entrada de usuários no servidor.\nUsuários com menos de X Dias de conta criada pode ser expulso ou banido.\n*Este sistema é integrado com o GSN, você pode ativar os logs usando o comando \`/logs\`',
                        fields: [
                            {
                                name: '🗓️ Dias Configurados',
                                value: data?.MinDay?.days
                                    ? `${data?.MinDay?.days} dias`
                                    : 'Nenhum dia foi configurado'
                            },
                            {
                                name: '🔨 Punição',
                                value: punishment(data?.MinDay?.punishment)
                            }
                        ]
                    }],
                    components
                })
            })

    }

    async function setPunishment() {

        await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $set: { 'MinDay.punishment': value } },
            { upsert: true, new: true }
        )
            .then(data => {
                Database.saveGuildCache(data?.id, data)
                return interaction.editReply({
                    content: null,
                    embeds: [{
                        color: client.blue,
                        title: `${e.Animated.SaphireReading} MinDay System Control`,
                        description: 'O MinDay é um sistema que controla a entrada de usuários no servidor.\nUsuários com menos de X Dias de conta criada pode ser expulso ou banido.\n*Este sistema é integrado com o GSN, você pode ativar os logs usando o comando \`/logs\`',
                        fields: [
                            {
                                name: '🗓️ Dias Configurados',
                                value: data?.MinDay?.days
                                    ? `${data?.MinDay?.days} dias`
                                    : 'Nenhum dia foi configurado'
                            },
                            {
                                name: '🔨 Punição',
                                value: punishment(data?.MinDay?.punishment)
                            }
                        ]
                    }],
                    components
                })
            })
    }
}