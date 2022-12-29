import register from './register.admin.js'
import deleteDb from './delete.admin.js'
import commandManager from './commandManager.admin.js'
import testAdmin from './test.admin.js'
import fanartAdmin from './fanart.admin.js'
import commitAdmin from './commit.admin.js'

export default async (interaction, subCommand) => {

    const command = {
        register: register,
        delete: deleteDb,
        commands: commandManager,
        test: testAdmin,
        fanart: fanartAdmin,
        commit: commitAdmin
    }[subCommand]

    if (!command)
        return await interaction.reply({
            content: 'Sub-Command Function Not Found',
            ephemeral: true
        })

    return command(interaction)
}