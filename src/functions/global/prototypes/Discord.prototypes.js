import { BaseInteraction, InteractionType } from 'discord.js'

BaseInteraction.prototype.isAutocomplete = function () {
    return this.type === InteractionType.ApplicationCommandAutocomplete
}

BaseInteraction.prototype.isModalSubmit = function () {
    return this.type === InteractionType.ModalSubmit
}