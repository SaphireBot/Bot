import register from './register.admin.js'
import deleteDb from './delete.admin.js'
import commandManager from './commandManager.admin.js'
import testAdmin from './test.admin.js'
import fanartAdmin from './fanart.admin.js'

export default async (interaction, subCommand) => {

    switch (subCommand) {
        case 'register': register(interaction); break;
        case 'delete': deleteDb(interaction); break;
        case 'commands': commandManager(interaction); break;
        case 'test': testAdmin(interaction); break;
        case 'fanart': fanartAdmin(interaction); break;

        default:
            await interaction.reply({
                content: 'Sub-Command Function Not Found',
                ephemeral: true
            })
            break;
    }
    return
}