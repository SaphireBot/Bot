import { ChatInputCommandInteraction } from "discord.js";
import { Emojis as e } from "../../../../../util/util.js";

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async (interaction, guildData) => {

    const { options } = interaction
    const member = options.getMember('member')

    if (!member)
        return interaction.reply({ content: `${e.Deny} | Nenhum membro encontrado.` })

    if (!guildData?.TempCall?.members) guildData.TempCall.members = {}
    if (!guildData?.TempCall?.membersMuted) guildData.TempCall.membersMuted = {}
    const data = { member: member, OnTime: guildData?.TempCall?.members[member.user.id] || 0, offTime: guildData?.TempCall?.membersMuted[member.user.id] || 0 }

    return interaction.reply({
        content: `👤 | ${member?.user?.tag || 'Not Found'} \`${member?.id}\`\n🎙️ \`${Date.stringDate(data.OnTime, true)}\`\n🔇 \`${Date.stringDate(data.offTime, true)}\``
    })
}