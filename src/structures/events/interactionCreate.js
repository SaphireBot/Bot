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

    if (!interaction) return

    if (client.restart)
        return await interaction.reply({
            content: `${e.Loading} | Processo de reinicialização iniciado.\n📝 | \`${client.restart || 'Nenhum dado informado'}\``,
            ephemeral: true
        })

    client.interactions++
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