import { ChannelType } from "discord.js"
import { Modals, Database } from "../../../../classes/index.js"
import { Permissions, DiscordPermissons } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"
import channelAnunciar from "../../../commands/functions/anunciar/channel.anunciar.js"

export default async ({ interaction, customId = { src: undefined }, values = [], guildData: guildResources }) => {

    const member = interaction?.member
    const message = interaction?.message
    const options = interaction?.options
    const guild = interaction?.guild

    if (!member.permissions.has(Permissions.Administrator))
        return await interaction.reply({
            content: `${e.Deny} | Apenas Administradores do servidor podem modificar a configuração deste sistema.`,
            ephemeral: true
        })

    const guildData = guildResources || await Database.Guild.findOne({ id: guild.id })
    const channel = options?.getChannel('notice_channel')
    const allowedRole = options?.getRole('allowed_role')
    const notificationRole = options?.getRole('notification_role')
    const channelDB = guildData?.announce?.channel
    const allowedRoleDB = guildData?.announce?.allowedRole
    const notificationRoleDB = guildData?.announce?.notificationRole
    const saveData = {}
    let response = ""

    if (customId?.src === "options") return optionsConfig()

    const administratationPermissions = [
        DiscordPermissons.KickMembers,
        DiscordPermissons.BanMembers,
        DiscordPermissons.ManageGuild,
        DiscordPermissons.ManageMessages,
        DiscordPermissons.MuteMembers,
        DiscordPermissons.DeafenMembers,
        DiscordPermissons.MoveMembers,
        DiscordPermissons.ManageNicknames,
        DiscordPermissons.ManageRoles,
        DiscordPermissons.Administrator,
        DiscordPermissons.ModerateMembers
    ]

    checkChannel();
    checkAllowedRole();
    checkNotificationRole();

    if (Object.keys(saveData || {})?.length)
        return validadeData()

    return channelAnunciar({ interaction, guildData, response })

    async function optionsConfig() {

        if (message.interaction.user.id !== interaction.user.id)
            return await interaction.reply({
                content: `${e.saphireLendo} | Será que foi você que usou este comando?`,
                ephemeral: true
            })

        const value = values[0]

        if (value === "reset") return resetSystem()
        if (value === "deleteMessage") return message.delete().catch(() => { })
        if (value === "refresh") return channelAnunciar({ interaction, guildData, toEdit: true })
        if (value === "notice") {

            if (!channel || !allowedRole || !notificationRole)
                return await interaction.reply({
                    content: `${e.Deny} | O sistema não está configurado corretamente. Por favor, use o comando \`/anunciar config\`.`,
                    ephemeral: true
                })

            return await interaction.showModal(Modals.NewNotice)
        }

        return await interaction.reply({
            content: `${e.Deny} | Nenhum valor foi encontrado para a execução.`,
            ephemeral: true
        })

        async function resetSystem() {

            return Database.Guild.findOneAndUpdate(
                { id: guild.id },
                {
                    $unset: { 'announce': true }
                },
                {
                    new: true,
                    upsert: true
                }
            )
                .then(guildData => channelAnunciar({ interaction, guildData, toEdit: true }))
                .catch(async err => {
                    console.log(err)
                    return await interaction.update({
                        content: `${e.Deny} | Houve um erro ao resetar o sistema de notícias neste servidor.\n${e.bug} | \`${err}\``,
                        embeds: [],
                        components: []
                    })
                }).catch(() => { })
        }

    }

    function checkChannel() {

        if (!channel) return

        if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) {
            response += `\n${e.Deny} | O canal de envio não é de Texto ou de Anúncio.`
            return;
        }

        if (channel.id === channelDB) {
            response += `\n${e.Deny} | O canal de envio é o mesmo salvo no banco de dados.`
            return;
        }

        if (!channelDB || channel.id !== channelDB) {
            saveData["announce.channel"] = channel.id
            response += `\n${e.Check} | O canal ${channel} foi salvo com sucesso.`
            return;
        }

        saveData["announce.channel"] = channel.id
        response += `\n${e.Warn} | Valor indefinido ao configurar o canal.`
        return;
    }

    function checkAllowedRole() {

        if (!allowedRole) return

        const permissions = allowedRole?.permissions?.toArray() || []

        for (let perm of administratationPermissions)
            if (permissions.includes(perm)) {
                response += `\n${e.Deny} | O cargo de permissão para enviar notícia possui permissões administrativas.`
                return;
            } else continue;

        if (allowedRole.id === allowedRoleDB) {
            response += `\n${e.Deny} | O cargo de permissão para enviar notícias é o mesmo salvo no banco de dados.`
            return;
        }

        if ([notificationRoleDB, notificationRole].includes(allowedRole.id)) {
            response += `\n${e.Deny} | Os cargos de notificação e permissão não podem ser os mesmos.`
            return;
        }

        if (!allowedRoleDB || allowedRole.id !== allowedRoleDB) {
            saveData['announce.allowedRole'] = allowedRole.id
            response += `\n${e.Check} | O cargo de permissão para envio de notícias foi salvo com sucesso.`
            return;
        }

        response += `\n${e.Warn} | Checagem do cargo de permissão para envio de permissão foi mal sucessido.`
        return;
    }

    function checkNotificationRole() {

        if (!notificationRole) return

        const permissions = notificationRole?.permissions?.toArray() || []

        for (let perm of administratationPermissions)
            if (permissions.includes(perm)) {
                response += `\n${e.Deny} | O cargo de notificação de notícias possui permissões administrativas.`
                return;
            } else continue;

        if (notificationRole.id === notificationRoleDB) {
            response += `\n${e.Deny} | O cargo de notificação de notícias é o mesmo salvo no banco de dados.`
            return;
        }

        if ([allowedRoleDB, allowedRole].includes(notificationRole.id)) {
            response += `\n${e.Deny} | Os cargos de notificação e permissão não podem ser os mesmos.`
            return;
        }

        if (!notificationRoleDB || notificationRole.id !== notificationRoleDB) {
            saveData['announce.notificationRole'] = notificationRole.id
            response += `\n${e.Check} | O cargo de notificação de notícias foi salvo com sucesso.`
            return;
        }

        response += `\n${e.Warn} | Checagem do cargo de notificação de notícias foi mal sucessido.`
        return;
    }

    async function validadeData() {
        const resultGuildDatabase = await Database.Guild.findOneAndUpdate(
            { id: guild.id },
            { $set: saveData },
            { new: true, upsert: true }
        )
        return channelAnunciar({ interaction, guildData: resultGuildDatabase, toEdit: false, response })
    }

}