import { ChannelType, ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from "../../../../../util/util.js"
import { Database } from "../../../../../classes/index.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    await interaction.reply({ content: `${e.Loading} | Carregando...` })

    const { options, guild } = interaction
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
        const guildsEnabled = await Database.Cache.TempCall.get('GuildsEnabled') || []
        if (!guildsEnabled.includes(guild.id))
            await Database.Cache.TempCall.push('GuildsEnabled', guild.id)

        await Database.Guild.updateOne(
            { id: guild.id },
            { $set: { 'TempCall.enable': true } }
        )
        await guild.members.fetch()

        const channelsData = guild.channels
            .cache
            .filter(ch => ch.type == ChannelType.GuildVoice)
            .filter(ch => ch.members.size)
            .map(ch => ({ channelId: ch.id, members: ch.members.toJSON() }))
            .flat()

        let membersInCall = 0

        if (channelsData.length)
            for await (let { channelId, members } of channelsData) {
                members = members.filter(m => !m?.user?.bot)?.map(m => m.id)
                membersInCall += members.length
                await Database.Cache.TempCall.set(`${guild.id}.inCall.${channelId}`, members)
                for (const memberId of members)
                    await Database.Cache.TempCall.set(`${guild.id}.${memberId}`, Date.now())
            }

        return interaction.editReply({
            content: `${e.Check} | Ok ok, agora vou contar o tempo em call de todo mundo (Menos bots, claro).\n${e.Info} | O tempo de atualização é de +/- 5 segundos.\n${membersInCall > 0 ? `${e.saphireLendo} | Já estou contando o tempo de ${membersInCall} membros em calls agora mesmo.` : ""}`
        }).catch(() => { })
    }

    async function disable() {
        await Database.Cache.TempCall.pull('GuildsEnabled', id => id == guild.id)
        await Database.Cache.TempCall.delete(guild.id)
        await Database.Cache.TempCall.delete(`${guild.id}.inCall`)
        await Database.Guild.updateOne(
            { id: guild.id },
            { $set: { 'TempCall.enable': false } }
        )

        return interaction.editReply({
            content: `${e.Check} | Pronto, agora o tempo não será mais contado.`
        }).catch(() => { })
    }

}