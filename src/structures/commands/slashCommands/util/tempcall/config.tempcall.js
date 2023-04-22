import { ChatInputCommandInteraction } from "discord.js"
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
        await Database.Cache.TempCall.push('GuildsEnabled', guild.id)
        await Database.Guild.updateOne(
            { id: guild.id },
            { $set: { 'TempCall.enable': true } }
        )

        return interaction.editReply({
            content: `${e.Check} | Ok ok, agora vou contar o tempo em call.\n${e.Info} | O tempo começará a ser contado apartir que um membro entrar em call de agora em diante.`
        }).catch(() => { })
    }

    async function disable() {
        await Database.Cache.TempCall.pull('GuildsEnabled', guild.id)
        await Database.Guild.updateOne(
            { id: guild.id },
            { $set: { 'TempCall.enable': false } }
        )

        return interaction.editReply({
            content: `${e.Check} | Pronto, agora o tempo não será mais contado.`
        }).catch(() => { })
    }

}