import { PermissionFlagsBits } from 'discord.js'
import {
    SlashCommandInteraction,
    Autocomplete,
    ButtonInteraction,
    ModalInteraction,
    SelectMenuInteraction,
    SaphireClient as client
} from '../../classes/index.js'
import { DiscordPermissons, PermissionsTranslate } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

client.on('interactionCreate', async interaction => {
    client.interactions++

    if (!interaction) return

    if (client.restart)
        return await interaction.reply({
            content: `${e.Loading} | Processo de reinicialização iniciado.\n📝 | \`${client.resttart || 'Nenhum dado informado'}\``,
            ephemeral: true
        })

    const channelPermissions = await interaction.channel.permissionsFor(client.user)
    const greenCard = Array.from(
        new Set([
            interaction.guild.members.me.permissions.missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]),
            channelPermissions?.missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])
        ].flat())
    )

    if (greenCard.length)
        return await interaction.reply({
            content: `${e.DenyX} | Eu não tenho permissão o suficiente para interagir neste canal.\n${e.Info} | Me falta ${greenCard.length} permiss${greenCard.length > 1 ? 'ões' : 'ão'}: ${greenCard.map(perm => `\`${PermissionsTranslate[perm] || perm}\``).join(', ')}`,
            ephemeral: true
        }).catch(() => { })

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