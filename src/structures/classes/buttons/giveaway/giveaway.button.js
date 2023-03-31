import { AttachmentBuilder, ButtonStyle } from "discord.js"
import { Database, GiveawayManager } from "../../../../classes/index.js"
import { Config, DiscordPermissons, PermissionsTranslate } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"
const messagesToEditButton = {}

export default async ({ interaction }, commandData) => {

    if (commandData?.src == 'ignore') return ignore()

    let { guild, user, message, channel, member } = interaction
    const gwId = commandData?.gwId || message.id
    let giveaway = await GiveawayManager.getGiveaway(gwId)

    if (!giveaway) {

        const gw = await Database.Guild.findOne({ id: guild.id }, 'Giveaways')
        giveaway = gw?.Giveaways.find(g => g.MessageID == gwId)

        if (!giveaway) {
            disableButton(true)
            return await interaction.reply({
                content: `${e.cry} | Por razões mistícas do universo, esse sorteio não existe mais.`,
                ephemeral: true
            })
        }
    }

    const hasEnded = (giveaway.TimeMS - (Date.now() - giveaway.DateNow) > 0) || !giveaway.Actived
    const execute = { join, list, leave }[commandData?.src]
    if (execute) return execute()

    return await interaction.reply({ content: `${e.bug} | Nenhuma sub-função encontrada. #18564846`, ephemeral: true })

    async function disableButton(both) {
        message = await channel.messages.fetch(gwId).catch(() => null)
        if (!message) return
        const components = message?.components[0]?.toJSON()
        if (!components) return
        components.components[0].disabled = true
        if (both) components.components[1].disabled = true
        return message.edit({ components: [components] }).catch(() => { })
    }

    async function join() {

        if (hasEnded) {
            disableButton()
            return interaction.reply({ content: `${e.cry} | Poooxa, o sorteio já foi acabou.`, ephemeral: true })
        }

        if (giveaway.Participants.includes(user.id))
            return askToLeave()

        if (giveaway.AllowedRoles?.length > 0) {
            const memberRolesIds = member.roles.cache.map(role => role.id)
            if (!giveaway.AllowedRoles.every(id => memberRolesIds.includes(id)))
                return await interaction.reply({
                    content: `${e.DenyX} | Poooxa, que pena. Você não tem todos os cargos obrigatórios para entrar neste sorteio.\n${e.Info} | Pra você entrar, falta esses cargos: ${giveaway.AllowedRoles.filter(roleId => !memberRolesIds.includes(roleId)).map(roleId => `<@&${roleId}>`).join(', ')}`,
                    ephemeral: true
                })
        }

        if (giveaway.LockedRoles?.length > 0) {
            const memberRolesIds = [...member.roles.cache.keys()]
            if (giveaway.LockedRoles.some(id => memberRolesIds.includes(id)))
                return await interaction.reply({
                    content: `${e.saphirePolicial} | Ora ora ora... Parece que você tem um dos cargos que estão bloqueados neste sorteio.\n${e.Info} | Esses são os cargos que você tem, mas estão bloqueados: ${giveaway.LockedRoles.filter(roleId => memberRolesIds.includes(roleId)).map(roleId => `<@&${roleId}>`).join(', ') || "??"}`,
                    ephemeral: true
                })
        }

        if (giveaway.AllowedMembers?.length > 0 && !giveaway.AllowedMembers?.includes(user.id))
            return await interaction.reply({
                content: `${e.cry} | Você não está na lista de pessoas que podem entrar no sorteio.`,
                ephemeral: true
            })

        if (giveaway.LockedMembers?.includes(user.id))
            return await interaction.reply({
                content: `${e.SaphireDesespero} | HOO MY GOOSH! Você está na lista de pessoas que não podem participar deste sorteio.`,
                ephemeral: true
            })

        GiveawayManager.pushParticipants(gwId, [user.id])
        return Database.Guild.findOneAndUpdate(
            { id: guild.id, 'Giveaways.MessageID': gwId },
            {
                $addToSet: { 'Giveaways.$.Participants': user.id }
            },
            { new: true }
        )
            .then(async document => {
                const giveawayObject = document.Giveaways.find(gw => gw.MessageID == gwId)

                if (!giveawayObject)
                    return await interaction.reply({
                        content: `${e.cry} | Que estranho... Não achei o sorteio no banco de dados... Você pode chamar um administrador por favor?`,
                        ephemeral: true
                    })

                GiveawayManager.pushParticipants(gwId, giveawayObject.Participants)
                refreshButton()
                await interaction.reply({
                    content: `${e.Tada} | Boooa! Coloquei você na lista de participantes.\n${e.sleep} | Agora é só esperar o sorteio terminar, boa sorte ${e.amongusdance}`,
                    ephemeral: true
                })

                if (hasEnded) return disableButton()
                return
            })
            .catch(async err => await interaction.reply({
                content: `${e.SaphireDesespero} | Não foi possível te adicionar no sorteio.\n${e.bug} | \`${err}\``,
                ephemeral: true
            }))

    }

    async function askToLeave() {
        return await interaction.reply({
            content: `${e.QuestionMark} | Você já está participando deste sorteio, você deseja sair?`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Sim, quero sair',
                            emoji: e.Leave,
                            custom_id: JSON.stringify({ c: 'giveaway', src: 'leave', gwId: gwId }),
                            style: ButtonStyle.Danger
                        },
                        {
                            type: 2,
                            label: 'Deixa pra lá',
                            emoji: '🫠',
                            custom_id: JSON.stringify({ c: 'giveaway', src: 'ignore' }),
                            style: ButtonStyle.Success
                        }
                    ]
                }
            ],
            ephemeral: true
        })
    }

    async function ignore() {
        return await interaction.update({
            content: `${e.sleep} | Ok, vamos fingir que nada aconteceu por aqui.`,
            components: []
        }).catch(() => { })
    }

    async function leave() {

        if (hasEnded)
            return await interaction.update({
                content: `${e.cry} | O sorteio já acabooou. Não da mais pra sair.`,
                components: []
            }).catch(() => { })

        if (!giveaway.Participants.includes(user.id))
            return await interaction.update({
                content: `${e.cry} | Você não está participando deste sorteio.`,
                components: []
            }).catch(() => { })

        return Database.Guild.findOneAndUpdate(
            { id: guild.id, 'Giveaways.MessageID': gwId },
            {
                $pull: { 'Giveaways.$.Participants': user.id }
            },
            { new: true }
        )
            .then(async document => {
                GiveawayManager.removeParticipants(gwId, user.id)
                const giveawayObject = document?.Giveaways?.find(gw => gw?.MessageID == gwId)

                if (!giveawayObject)
                    return await interaction.update({
                        content: `${e.cry} | Que estranho... Não achei o sorteio no banco de dados... Você pode chamar um administrador por favor?`,
                        components: []
                    })

                refreshButton()
                return await interaction.update({
                    content: `${e.cry} | Pronto pronto, você não está mais participando deste sorteio.`,
                    components: []
                }).catch(() => { })
            })
            .catch(async err => await interaction.update({
                content: `${e.SaphireDesespero} | Não foi possível te retirar do sorteio.\n${e.bug} | \`${err}\``,
                ephemeral: true
            }))
    }

    async function list() {

        if (!guild.members.me.permissions.has(DiscordPermissons.AttachFiles, true))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.AttachFiles}\`** para executar este recurso.`,
                ephemeral: true
            })

        const participants = giveaway.Participants || []
        const winners = giveaway.WinnersGiveaway || []

        await interaction.reply({ content: `${e.Loading} | Ok, só um segundo...`, ephemeral: true }).catch(() => { })

        await guild.members.fetch()
        const participantsMapped = participants.length > 0
            ? participants
                .map((id, i) => `${i + 1}. ${guild.members.cache.get(id)?.user?.tag || 'user#0000'} (${id})`)
                .join('\n')
            : '~~ Ninguém ~~'

        const winnersMapped = winners.length > 0
            ? winners
                .map((id, i) => `${i + 1}. ${guild.members.cache.get(id)?.user?.tag || 'user#0000'} (${id})`)
                .join('\n')
            : '~~ Ninguém ~~'

        const buffer = createBuffer()
        return await interaction.editReply({
            content: `${e.sleep} | Se você encontrar qualquer erro, por favor, fale para os meus administradores no [meu servidor](${Config.MoonServerLink})`,
            files: [new AttachmentBuilder(buffer, { name: 'participants.txt', description: `Lista de participantes do sorteio ${gwId}` })]
        })
            .catch(async err => await interaction.editReply({ content: `${e.Info} | Tive um pequeno problema na autenticação da lista de usuários. Por favor, tente novamente daqui uns segundos.\n${e.bug} | \`${err}\``, }).catch(() => { }))

        function createBuffer() {
            return Buffer.from(
                `Dados do Sorteio ${gwId}
Servidor: ${guild.name}
Lançado por: ${guild.members.cache.get(giveaway.Sponsor)?.user?.tag || 'User Not Found'} (${giveaway.Sponsor})
Prêmio: ${giveaway.Prize}
Tempo de Espera: ${Date.stringDate(giveaway.TimeMs)}
Data Prevista para Disparo: ${Date.format(giveaway.DateNow + giveaway.TimeMs, false, false)}
Data de Disparo: ${giveaway.DischargeDate ? Date.format(giveaway.DateNow + giveaway.TimeMs, false, false) : 'Não disparado ainda'}
Data de Criação Deste Registro: ${Date.format(Date.now(), false, false)}
--------------------------------------------------------------
${giveaway.AllowedMembers?.length > 0 ? `${giveaway.AllowedMembers?.length} ` : ''}Usuários Permitidos:\n${giveaway.AllowedMembers?.length ? giveaway.AllowedMembers?.map(id => `${guild.members.cache.get(id)?.user?.tag || 'User Not Found'} (${id})`).join('\n') : '~~ Nenhum ~~'}
--------------------------------------------------------------
${giveaway.LockedMembers?.length > 0 ? `${giveaway.LockedMembers?.length} ` : ''}Usuários Bloqueados:\n${giveaway.LockedMembers?.length ? giveaway.LockedMembers?.map(id => `${guild.members.cache.get(id)?.user?.tag || 'User Not Found'} (${id})`).join('\n') : '~~ Nenhum ~~'}
--------------------------------------------------------------
${giveaway.AllowedRoles?.length > 0 ? `${giveaway.AllowedRoles?.length} ` : ''}Cargos Obrigatórios:\n${giveaway.AllowedRoles?.length ? giveaway.AllowedRoles?.map(id => `${guild.roles.cache.get(id)?.name || 'Role Name Not Found'} (${id})`).join('\n') : '~~ Nenhum ~~'}
--------------------------------------------------------------
${giveaway.LockedRoles?.length > 0 ? `${giveaway.LockedRoles?.length} ` : ''}Cargos Bloqueados:\n${giveaway.LockedRoles?.length ? giveaway.LockedRoles?.map(id => `${guild.roles.cache.get(id)?.name || 'Role Name Not Found'} (${id})`).join('\n') : '~~ Nenhum ~~'}
--------------------------------------------------------------
${winners?.length > 0 ? `${winners.length} ` : ''}Vencedores do Sorteio:\n${winnersMapped}
--------------------------------------------------------------
${participants.length > 0 ? `${participants.length} ` : ''}Participantes Por Ordem de Entrada:\n${participantsMapped}`
            )
        }

    }

    function refreshButton() {
        if (messagesToEditButton[gwId] || hasEnded) return
        messagesToEditButton[gwId] = true
        return setTimeout(() => edit(), 2500)

        async function edit() {
            const giveaway = GiveawayManager.getGiveaway(gwId)
            delete messagesToEditButton[gwId]
            if (!giveaway?.Actived) return
            message = await channel.messages.fetch(gwId).catch(() => null)
            if (!message) return
            const components = message?.components[0]?.toJSON()
            if (components) {
                components.components[0].label = `Participar (${giveaway.Participants.length || '0'})`
                components.components[0].disabled = (giveaway.TimeMS - (Date.now() - giveaway.DateNow) > 0)
                return message.edit({ components: [components] }).catch(() => { })
            }
            return
        }
    }

}