import register from './register.admin.js'
import deleteDb from './delete.admin.js'
import commands from './commandManager.admin.js'
import test from './test.admin.js'
import fanart from './fanart.admin.js'
import commit from './commit.admin.js'
import invite from './invite.admin.js'
import reboot from './reboot.admin.js'
import backup from './backup.admin.js'
import fetch_guild_members from './fetch_guild_members.admin.js'
import roles_server from './roles_server.admin.js'

export default async (interaction, subCommand) => {

    const command = {
        register, commands, test, fanart, commit, invite, reboot,
        delete: deleteDb, backup, fetch_guild_members, roles_server
    }[subCommand]

    if (!command)
        return await interaction.reply({
            content: 'Sub-Command Function Not Found',
            ephemeral: true
        })

    return command(interaction)
}