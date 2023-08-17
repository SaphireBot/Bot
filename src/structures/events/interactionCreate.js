import { PermissionsTranslate } from '../../util/Constants.js'
import { PermissionFlagsBits } from 'discord.js'
import { Emojis as e } from '../../util/util.js'
import { socket } from '../../websocket/websocket.js'
import unhandledRejection from '../../classes/modules/errors/process/unhandledRejection.js'
import { SlashCommandInteraction, Autocomplete, ButtonInteraction, ModalInteraction, SelectMenuInteraction, SaphireClient as client } from '../../classes/index.js'

client.on('interactionCreate', async interaction => {
    client.interactions++

    if (!interaction || (interaction.guild && !interaction.guild?.available)) return
    if (socket?.connected) socket?.send({ type: "addInteraction" })

    if (client.restart) {

        if (interaction.isAutocomplete()) return interaction.respond([])

        return interaction?.reply({
            content: `${e.Loading} | Processo de reinicialização iniciado.\n📝 | \`${client.restart || 'Nenhum dado informado'}\``,
            ephemeral: true
        })
    }

    if (
        !interaction.channel.isDMBased()
        && !interaction.isAutocomplete()
    ) {
        const channelPermissions = interaction.channel.permissionsFor(client.user)
        const greenCard = Array.from(
            new Set([
                interaction.guild.members.me.permissions.missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]),
                channelPermissions?.missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])
            ].flat())
        )

        if (greenCard.length)
            return interaction?.reply({
                content: `${e.DenyX} | Eu não tenho permissão o suficiente para interagir neste canal.\n${e.Info} | Me falta ${greenCard.length} permiss${greenCard.length > 1 ? 'ões' : 'ão'}: ${greenCard.map(perm => `\`${PermissionsTranslate[perm] || perm}\``).join(', ')}`,
                ephemeral: true
            }).catch(() => { })
    }

    try {
        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) return await new SlashCommandInteraction(interaction).CheckBeforeExecute()
        if (interaction.isButton()) return await new ButtonInteraction(interaction).execute()
        if (interaction.isAnySelectMenu()) return await new SelectMenuInteraction(interaction).filterAndChooseFunction()
        if (interaction.isAutocomplete()) return await new Autocomplete(interaction).build()
        if (interaction.isModalSubmit()) return await new ModalInteraction(interaction, client).submitModalFunctions()
    } catch (err) {
        if (err?.code == 10062) return
        return unhandledRejection(err)
    }

    return interaction.reply({ content: "Modelo de interação não encontrado.", ephemeral: true })
})