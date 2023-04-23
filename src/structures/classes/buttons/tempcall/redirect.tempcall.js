import { ButtonInteraction, ButtonStyle, ChannelType, PermissionFlagsBits } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database, TempCallManager } from "../../../../classes/index.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { src: 'muteTime' | 'enable' | 'disable' } } commandData
 */
export default async (interaction, commandData) => {

    const { member, user, guildId, guild } = interaction

    if (!member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({
            content: `${e.Deny} | Você precisa ser um administrador para usar esse comando, sabia?`,
            ephemeral: true
        })

    if (commandData && user.id !== interaction?.message?.interaction?.user?.id)
        return interaction.reply({
            content: `${e.Deny} | Você não pode clicar aqui, sai sai, xô.`,
            ephemeral: true
        })

    const execute = { enable, disable, muteTime }[commandData.src]

    if (!execute)
        return interaction.reply({
            content: `${e.SaphireDesespero} | Sub-Função não encontrada. #168680000`,
            ephemeral: true
        })

    return execute()

    async function enable() {
        if (TempCallManager.guildsId.includes(guildId))
            return interaction.update({
                content: `${e.saphireLendo} | Eu olhei aqui e este servidor já tem o Tempo em Call ativado.`,
                components: []
            }).catch(() => { })

        TempCallManager.guildsId.push(guildId)
        await interaction.update({ content: `${e.Loading} | Carregando...`, components: [] }).catch(() => { })

        if (!TempCallManager.inCall[guildId])
            TempCallManager.inCall[guildId] = {}

        if (!TempCallManager.inMute[guildId])
            TempCallManager.inMute[guildId] = {}

        const guildData = await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $set: { 'TempCall.enable': true } },
            { new: true, upsert: true, fields: "TempCall" }
        )

        await guild.members.fetch()

        let membersInCall = 0
        guild.channels.cache
            .filter(channel => channel.type == ChannelType.GuildVoice && channel.members?.size)
            .forEach(channel => {
                const channelsMembersId = channel.members.filter(member => !member.user?.bot).map(member => member.user.id)
                membersInCall += channelsMembersId.length
                for (const memberId of channelsMembersId)
                    TempCallManager.inCall[guildId][memberId] = Date.now()
            })

        const data = {
            enable: guildData?.TempCall?.enable || false,
            muteTime: guildData?.TempCall?.muteTime || false
        }

        return interaction.editReply({
            content: `${e.Check} | Ok ok, agora vou contar o tempo em call de todo mundo (Menos bots, claro).\n${e.Info} | O tempo de atualização é de +/- 30 segundos.\n${membersInCall > 0 ? `${e.saphireLendo} | Já estou contando o tempo de ${membersInCall} membros em calls agora mesmo.` : ""}`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: data.enable ? 'Ativado' : 'Desativado',
                            emoji: data.enable ? e.CheckV : e.DenyX,
                            custom_id: JSON.stringify({ c: 'tcall', src: data.enable ? 'disable' : 'enable' }),
                            style: data.enable ? ButtonStyle.Success : ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            label: data.muteTime ? 'Salvar Tempo Mutado' : 'Ignorar Tempo Mutado',
                            emoji: data.muteTime ? e.CheckV : e.DenyX,
                            custom_id: JSON.stringify({ c: 'tcall', src: 'muteTime' }),
                            style: data.muteTime ? ButtonStyle.Success : ButtonStyle.Secondary
                        }
                    ]
                }
            ]
        })
    }

    async function disable() {

        delete TempCallManager.inCall[guildId]
        if (!TempCallManager.guildsId.includes(guildId))
            return interaction.update({
                content: `${e.saphireLendo} | Meus sistemas dizem que este servidor não tem o Tempo em Call ativo.`,
                components: []
            }).catch(() => { })

        TempCallManager.guildsId = TempCallManager.guildsId.filter(id => id != guildId)

        const guildData = await Database.Guild.findOneAndUpdate(
            { id: guild.id },
            {
                $set: {
                    'TempCall.enable': false,
                    'TempCall.muteTime': false
                }
            },
            { new: true, upsert: true, fields: 'TempCall' }
        )

        const data = {
            enable: guildData?.TempCall?.enable || false,
            muteTime: guildData?.TempCall?.muteTime || false
        }

        return interaction.update({
            content: `${e.Check} | Pronto, agora o tempo em call não será mais contado.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: data.enable ? 'Ativado' : 'Desativado',
                            emoji: data.enable ? e.CheckV : e.DenyX,
                            custom_id: JSON.stringify({ c: 'tcall', src: data.enable ? 'disable' : 'enable' }),
                            style: data.enable ? ButtonStyle.Success : ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            label: data.muteTime ? 'Salvar Tempo Mutado' : 'Ignorar Tempo Mutado',
                            emoji: data.muteTime ? e.CheckV : e.DenyX,
                            custom_id: JSON.stringify({ c: 'tcall', src: 'muteTime' }),
                            style: data.muteTime ? ButtonStyle.Success : ButtonStyle.Secondary,
                            disabled: !data.enable
                        }
                    ]
                }
            ]
        }).catch(() => { })
    }

    async function muteTime() {

        if (!TempCallManager.guildsId.includes(guildId))
            return interaction.update({
                content: `${e.saphireLendo} | O sistema precisa estar ativo para ativar este recurso.`,
                components: []
            }).catch(() => { })

        await interaction.update({ content: `${e.Loading} | Autenticando mudanças...` }).catch(() => { })

        const state = !TempCallManager.guildsWithMuteCount.includes(guildId)

        TempCallManager.guildsWithMuteCount.includes(guildId)
            ? TempCallManager.guildsWithMuteCount = TempCallManager.guildsWithMuteCount.filter(id => id != guildId)
            : TempCallManager.guildsWithMuteCount.push(guildId)

        guild.channels.cache
            .filter(channel => channel.type == ChannelType.GuildVoice && channel.members?.size)
            .forEach(channel => channel.members
                .forEach(member => {
                    if (!member.user.bot) {
                        state
                            && (member.voice.selfMute
                                || member.voice.selfDeaf
                                || member.voice.serverMute
                                || member.voice.serverDeaf)
                            ? mutedUser(member.user.id)
                            : inCallUser(member.user.id)
                    }
                }))

        const guildData = await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $set: { 'TempCall.muteTime': state } },
            { new: true, upsert: true, fields: "TempCall" }
        )

        const data = {
            enable: guildData?.TempCall?.enable || false,
            muteTime: guildData?.TempCall?.muteTime || false
        }

        return interaction.editReply({
            content: data.muteTime
                ? `${e.Check} | Beleza! De agora em diante, eu vou contar o tempo de membros que ficarem mutados.`
                : `${e.Deny} | Okay. O tempo mutado não será mais contado.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: data.enable ? 'Ativado' : 'Desativado',
                            emoji: data.enable ? e.CheckV : e.DenyX,
                            custom_id: JSON.stringify({ c: 'tcall', src: data.enable ? 'disable' : 'enable' }),
                            style: data.enable ? ButtonStyle.Success : ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            label: data.muteTime ? 'Salvar Tempo Mutado' : 'Ignorar Tempo Mutado',
                            emoji: data.muteTime ? e.CheckV : e.DenyX,
                            custom_id: JSON.stringify({ c: 'tcall', src: 'muteTime' }),
                            style: data.muteTime ? ButtonStyle.Success : ButtonStyle.Secondary,
                            disabled: !data.enable
                        }
                    ]
                }
            ]
        }).catch(() => { })

        async function inCallUser(memberId) {
            delete TempCallManager.inMute[guildId][memberId]
            if (!TempCallManager.inCall[guildId]) TempCallManager.inCall[guildId] = {}
            if (!TempCallManager.inCall[guildId][memberId])
                TempCallManager.inCall[guildId][memberId] = Date.now()
        }

        async function mutedUser(memberId) {
            delete TempCallManager.inCall[guildId][memberId]
            if (!TempCallManager.inMute[guildId]) TempCallManager.inMute[guildId] = {}
            if (!TempCallManager.inMute[guildId][memberId])
                TempCallManager.inMute[guildId][memberId] = Date.now()
        }

    }

}