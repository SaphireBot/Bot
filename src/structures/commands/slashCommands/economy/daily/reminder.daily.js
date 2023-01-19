import { ButtonStyle } from 'discord.js'
import { Database } from '../../../../../classes/index.js'
import { CodeGenerator } from '../../../../../functions/plugins/plugins.js'
import managerReminder from '../../../../../functions/update/reminder/manager.reminder.js'
import { Emojis as e } from '../../../../../util/util.js'

export default async (interaction, dateNow, oneDayMiliseconds) => {

    const { user, channel, commandId, guild } = interaction
    const reminder = await Database.Reminder.findOne({ userId: user.id, DateNow: dateNow })

    if (reminder)
        return await interaction.reply({
            content: `${e.Deny} | Você já está com um lembrete automático do </daily:${commandId}> configurado para disparo ${Date.Timestamp(new Date(dateNow + oneDayMiliseconds), 'R', true)}.`
        })

    const buttons = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Confirmar',
                custom_id: 'accept',
                style: ButtonStyle.Success
            },
            {
                type: 2,
                label: 'Cancelar',
                custom_id: 'deny',
                style: ButtonStyle.Danger
            }
        ]
    }

    const msg = await interaction.reply({
        content: `${e.QuestionMark} | Você deseja ativar o lembrete automático do </daily:${commandId}>? Você será notificado ${Date.Timestamp(new Date(dateNow + oneDayMiliseconds), 'R', true)}.`,
        components: [buttons],
        fetchReply: true
    })

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        time: 60000,
        max: 1
    })
        .on('collect', async ButtonInteraction => {

            const { customId } = ButtonInteraction

            if (customId === 'deny') return collector.stop()

            return revalidadeDailyReminder()

        })
        .on('end', async (_, reason) => {

            if (reason === 'user')
                return await interaction.editReply({
                    content: `${e.Deny} | Reconfiguração de lembrete automático desativado.`,
                    components: []
                }).catch(() => { })

            if (reason === 'time')
                return await interaction.editReply({
                    content: `${e.Deny} | Tempo limite de resposta excedido.`,
                    components: []
                }).catch(() => { })

            if (reason === 'limit') return

            return
        })

    async function revalidadeDailyReminder() {
        managerReminder.save(user, {
            id: CodeGenerator(7).toUpperCase(),
            userId: user.id,
            guildId: guild.id,
            RemindMessage: 'Daily Disponível',
            Time: 86400000,
            DateNow: dateNow,
            isAutomatic: true,
            ChannelId: channel.id
        })

        return await interaction.editReply({
            content: `${e.Check} | Lembrete automático configurado com sucesso. Eu vou te lembrar ${Date.Timestamp(new Date(dateNow + oneDayMiliseconds), 'R', true)} para você resgatar o </daily:${commandId}> novamente.`,
            components: []
        })
    }
}