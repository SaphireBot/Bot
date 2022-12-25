import {
    SlashCommand,
    Autocomplete,
    ButtonInteraction,
    ModalInteraction,
    SelectMenuInteraction,
    SaphireClient as client
} from '../../classes/index.js'

client.on('interactionCreate', async interaction => {

    if (!interaction) return

    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) return new SlashCommand(interaction).CheckBeforeExecute()
    if (interaction.isButton()) return new ButtonInteraction(interaction).execute()
    if (interaction.isAnySelectMenu()) return new SelectMenuInteraction(interaction).filterAndChooseFunction()
    if (interaction.isAutocomplete()) return new Autocomplete(interaction).build()
    if (interaction.isModalSubmit()) return new ModalInteraction(interaction, client).submitModalFunctions()
    return
})