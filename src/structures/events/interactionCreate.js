import { PermissionsBitField } from 'discord.js'
import {
    SlashCommandInteraction,
    Autocomplete,
    ButtonInteraction,
    ModalInteraction,
    SelectMenuInteraction,
    SaphireClient as client
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('interactionCreate', async interaction => {
    client.interactions++

    if (!interaction) return

    if (client.restart)
        return await interaction.reply({
            content: `${e.Loading} | Processo de reinicialização iniciado.\n📝 | \`${client.restart || 'Nenhum dado informado'}\``,
            ephemeral: true
        })

    const channelPermissions = interaction.channel.permissionsFor(interaction.guild.members.me, true)
    if (!channelPermissions || !channelPermissions.has([PermissionsBitField.Flags.ViewAuditLog, PermissionsBitField.Flags.SendMessages]))
        return await interaction.reply({
            content: `${e.DenyX} | Eu não tenho permissão para ver ou enviar mensagem neste canal.`,
            ephemeral: true
        })

    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) return new SlashCommandInteraction(interaction).CheckBeforeExecute()
    if (interaction.isButton()) return new ButtonInteraction(interaction).execute()
    if (interaction.isAnySelectMenu()) return new SelectMenuInteraction(interaction).filterAndChooseFunction()
    if (interaction.isAutocomplete()) return new Autocomplete(interaction).build()
    if (interaction.isModalSubmit()) return new ModalInteraction(interaction, client).submitModalFunctions()

    return await interaction.reply({
        content: "Modelo de interação não encontrado.",
        ephemeral: true
    })
})