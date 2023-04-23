import { ChannelType, ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from "../../../../../util/util.js"
import { Database, TempCallManager } from "../../../../../classes/index.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    await interaction.reply({ content: `${e.Loading} | Carregando...` })

    const { options, guild, guildId } = interaction
    return { reset, enable, disable }[options.getString('method')]()

    async function reset() {
        await Database.Guild.updateOne(
            { id: guild.id },
            { $unset: { 'TempCall.members': true } }
        )

        return interaction.editReply({
            content: `${e.CheckV} | Ranking de Tempo em Call resetado.`
        }).catch(() => { })
    }

    async function enable() {
        if (TempCallManager.guildsId.includes(guildId))
            return interaction.editReply({
                content: `${e.saphireLendo} | Eu olhei aqui e este servidor já tem o Tempo em Call ativado.`
            })

        if (!TempCallManager.inCall[guildId])
            TempCallManager.inCall[guildId] = {}

        if (!TempCallManager.guildsId.includes(guildId))
            TempCallManager.guildsId.push(guildId)

        await Database.Guild.updateOne(
            { id: guild.id },
            { $set: { 'TempCall.enable': true } }
        )
        await guild.members.fetch()

        let membersInCall = 0
        guild.channels.cache
            .filter(channel => channel.type == ChannelType.GuildVoice && channel.members?.size)
            .forEach(channel => {
                const channelsMembersId = channel.members.filter(member => !member.user?.bot).map(member => member.user.id)
                membersInCall += channelsMembersId.length
                for (const memberId of channelsMembersId) {
                    TempCallManager.inCall[guildId][memberId] = Date.now()
                }
            })

        return interaction.editReply({
            content: `${e.Check} | Ok ok, agora vou contar o tempo em call de todo mundo (Menos bots, claro).\n${e.Info} | O tempo de atualização é de +/- 5 segundos.\n${membersInCall > 0 ? `${e.saphireLendo} | Já estou contando o tempo de ${membersInCall} membros em calls agora mesmo.` : ""}`
        }).catch(() => { })
    }

    async function disable() {

        delete TempCallManager.inCall[guildId]
        if (!TempCallManager.guildsId.includes(guildId))
            return interaction.editReply({
                content: `${e.saphireLendo} | Meus sistemas dizem que este servidor não tem o Tempo em Call ativo.`
            })

        TempCallManager.guildsId = TempCallManager.guildsId.filter(id => id != guildId)

        await Database.Guild.updateOne(
            { id: guild.id },
            { $set: { 'TempCall.enable': false } }
        )

        return interaction.editReply({
            content: `${e.Check} | Pronto, agora o tempo não será mais contado.`
        }).catch(() => { })
    }

}