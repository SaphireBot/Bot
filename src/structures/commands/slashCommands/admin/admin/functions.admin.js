import register from './register.admin.js'
import deleteDb from './delete.admin.js'

export default async (interaction, subCommand) => {

    switch (subCommand) {
        case 'register': register(interaction); break;
        case 'delete': deleteDb(interaction); break;

        default:
            await interaction.reply({
                content: 'Sub-Command Function Not Found',
                ephemeral: true
            })
            break;
    }
    return
}