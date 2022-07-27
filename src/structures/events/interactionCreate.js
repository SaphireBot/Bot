// const ModalInteraction = require('../../modules/classes/ModalInteraction')
// const SelectMenuInteraction = require('../../modules/classes/SelectMenuInteraction')
import {
    SlashCommand,
    Autocomplete,
    ButtonInteraction,
    SaphireClient as client
} from '../../classes/index.js'

client.on('interactionCreate', async interaction => {

    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) return new SlashCommand(interaction).CheckBeforeExecute()
    if (interaction.isButton()) return new ButtonInteraction(interaction).execute()
    // if (type === 3 && componentType === 3) return new SelectMenuInteraction(interaction).filterAndChooseFunction()
    if (interaction.isAutocomplete()) return new Autocomplete(interaction).build()
    // if (type === 5) return new ModalInteraction(interaction, client).submitModalFunctions()
    return
})