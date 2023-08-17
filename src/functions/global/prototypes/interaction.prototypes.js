import { BaseInteraction } from 'discord.js'

Object.defineProperty(BaseInteraction.prototype, 'mention', {
    get: function () {
        const subCommand = this.options?.data[0]?.name
        if (subCommand)
            return `</${this.commandName} ${subCommand}:${this.commandId}>`
        return `</${this.commandName}:${this.commandId}>`
    }
})