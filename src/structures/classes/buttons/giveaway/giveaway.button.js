import { Database, GiveawayManager, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { ButtonStyle } from "discord.js"
const messagesToEditButton = {}

export default async ({ interaction }, commandData) => {

    if (commandData?.src == 'ignore') return ignore()

    let { guild, user, message, channel, member } = interaction
    const gwId = commandData?.gwId || message.id
    let giveaway = GiveawayManager.getGiveaway(gwId)

    if (!giveaway) {

        const gw = await Database.getGuild(guild.id)
        giveaway = gw?.Giveaways?.find(g => g.MessageID == gwId)

        if (!giveaway) {
            disableButton(true)
            return interaction.reply({
                content: `${e.Animated.SaphireCry} | Por razões mistícas do universo, esse sorteio não existe mais.`,
                ephemeral: true
            })
        }
    }

    const hasEnded = (giveaway.TimeMS - (Date.now() - giveaway.DateNow) > 0) || !giveaway.Actived
    const execute = { join, list, leave }[commandData?.src]
    if (execute) return execute()

    return interaction.reply({ content: `${e.bug} | Nenhuma sub-função encontrada. #18564846`, ephemeral: true })

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

        await interaction.reply({
            content: `${e.Loading} | Carregando dados do sorteio...`,
            ephemeral: true
        })

        if (hasEnded) {
            disableButton()
            return interaction.editReply({ content: `${e.Animated.SaphireCry} | Poooxa, o sorteio já foi acabou.`, ephemeral: true }).catch(() => { })
        }

        if (giveaway.Participants.includes(user.id))
            return askToLeave()

        if (giveaway.MinAccountDays > 0) {
            const accountDays = parseInt((new Date() - new Date(user?.createdAt.valueOf())) / (1000 * 60 * 60 * 24))

            if (giveaway.MinAccountDays > accountDays)
                return interaction.editReply({
                    content: `${e.Animated.SaphireCry} | Você não pode entrar nesse sorteio. A sua conta possui **${accountDays.currency()}** dias e o sorteio exige **${giveaway.MinAccountDays.currency()} dias**.\n${e.Info} | Falta mais **${(giveaway.MinAccountDays - accountDays).currency()} dias** para você entrar neste sorteio.`
                }).catch(() => { })
        }

        if (giveaway.MinInServerDays > 0) {
            const accountDays = parseInt((new Date() - new Date(member?.joinedAt.valueOf())) / (1000 * 60 * 60 * 24))

            if (giveaway.MinInServerDays > accountDays)
                return interaction.editReply({
                    content: `${e.Animated.SaphireCry} | Você não pode entrar nesse sorteio. Você entrou no servidor há **${accountDays.currency()}** dias e o sorteio exige que você esteja no servidor há pelo menos **${giveaway.MinInServerDays.currency()} dias**.\n${e.Info} | Falta mais **${(giveaway.MinInServerDays - accountDays).currency()} dias** para você entrar neste sorteio.`
                }).catch(() => { })
        }

        let hasRole = false

        if (giveaway.AllowedRoles?.length && !giveaway.AllowedMembers.includes(user.id)) {

            if (giveaway.RequiredAllRoles) {
                // if (!giveaway.AllowedRoles.every(id => memberRolesIds.includes(id)))
                if (!member.roles.cache.hasAll(...giveaway.AllowedRoles))
                    return interaction.editReply({
                        content: `${e.Animated.SaphireQuestion} | Hmmm... Parece que você não tem todos os cargos obrigatórios.\n${e.Info} | Pra você entrar, falta esses cargos: ${giveaway.AllowedRoles.filter(roleId => !member.roles.cache.has(roleId)).map(roleId => `<@&${roleId}>`).join(', ')}`,
                        ephemeral: true
                    }).catch(() => { })
            }
            else
                if (!member.roles.cache.hasAny(...giveaway.AllowedRoles))
                    return interaction.editReply({
                        content: `${e.DenyX} | Ooops! Você não possui nenhum dos cargos selecionados.\n${e.Info} | Pra você entrar, você precisa de pelo menos um desses cargos: ${giveaway.AllowedRoles.map(roleId => `<@&${roleId}>`).join(', ')}`,
                        ephemeral: true
                    }).catch(() => { })
            hasRole = true
        }

        if (giveaway.LockedRoles?.length) {
            if (member.roles.cache.hasAny(...giveaway.LockedRoles))
                return interaction.editReply({
                    content: `${e.saphirePolicial} | Ora ora ora... Parece que você tem um dos cargos que estão bloqueados neste sorteio.\n${e.Info} | Esses são os cargos que você tem, mas estão bloqueados: ${giveaway.LockedRoles.filter(roleId => member.roles.cache.has(roleId)).map(roleId => `<@&${roleId}>`).join(', ') || "??"}`,
                    ephemeral: true
                }).catch(() => { })
        }

        if (giveaway.AllowedMembers?.length > 0 && !giveaway.AllowedMembers?.includes(user.id) && !hasRole)
            return interaction.editReply({
                content: `${e.Animated.SaphireCry} | Você não está na lista de pessoas que podem entrar no sorteio.`,
                ephemeral: true
            }).catch(() => { })

        if (giveaway.LockedMembers?.includes(user.id))
            return interaction.editReply({
                content: `${e.Animated.SaphirePanic} | HOO MY GOOSH! Você está na lista de pessoas que não podem participar deste sorteio.`,
                ephemeral: true
            }).catch(() => { })

        GiveawayManager.pushParticipants(gwId, [user.id])
        return await Database.Guild.findOneAndUpdate(
            { id: guild.id, 'Giveaways.MessageID': gwId },
            { $addToSet: { 'Giveaways.$.Participants': user.id } },
            { new: true }
        )
            .then(async document => {
                Database.saveGuildCache(document.id, document)
                const giveawayObject = document.Giveaways.find(gw => gw.MessageID == gwId)

                if (!giveawayObject)
                    return interaction.editReply({
                        content: `${e.Animated.SaphireQuestion} | Que estranho... Não achei o sorteio no banco de dados... Você pode chamar um administrador por favor?`,
                        ephemeral: true
                    }).catch(() => { })

                GiveawayManager.pushParticipants(gwId, giveawayObject.Participants)
                refreshButton()
                const phrase = [
                    "Boooa! Te coloquei na lista de participantes.",
                    "Aeee! Agora você está participando deste sorteio.",
                    `Okay okaaay. Agora você está concorrendo contra outros ${giveawayObject.Participants.length - 1} participantes.`,
                    "Uhhuuuuu!! Você entrou no sorteio."
                ][Math.floor(Math.random() * 4)]

                if (hasEnded) disableButton()
                return await interaction.editReply({
                    content: `${e.Animated.SaphireDance} | ${phrase}\n${e.Animated.SaphireSleeping} | Agora é só esperar o sorteio terminar, boa sorte.`,
                    ephemeral: true
                }).catch(() => { })
            })
            .catch(err => interaction.editReply({
                content: `${e.Animated.SaphirePanic} | Não foi possível te adicionar no sorteio.\n${e.bug} | \`${err}\``,
                ephemeral: true
            }).catch(() => { }))

    }

    async function askToLeave() {
        return interaction.editReply({
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
        }).catch(() => { })
    }

    async function ignore() {
        return interaction.update({
            content: `${e.Animated.SaphireSleeping} | Ok, vamos fingir que nada aconteceu por aqui.`,
            components: []
        }).catch(() => { })
    }

    async function leave() {

        if (hasEnded)
            return interaction.update({
                content: `${e.Animated.SaphireCry} | O sorteio já acabooou. Não da mais pra sair.`,
                components: []
            }).catch(() => { })

        if (!giveaway.Participants.includes(user.id))
            return interaction.update({
                content: `${e.Animated.SaphireQuestion} | Pera aí, parece que você não está participando desse sorteio.`,
                components: []
            }).catch(() => { })

        return Database.Guild.findOneAndUpdate(
            { id: guild.id, 'Giveaways.MessageID': gwId },
            { $pull: { 'Giveaways.$.Participants': user.id } },
            { new: true }
        )
            .then(document => {
                Database.saveGuildCache(document.id, document)
                GiveawayManager.removeParticipants(gwId, user.id)
                const giveawayObject = document?.Giveaways?.find(gw => gw?.MessageID == gwId)

                if (!giveawayObject)
                    return interaction.update({
                        content: `${e.Animated.SaphireQuestion} | Que estranho... Não achei o sorteio no banco de dados... Você pode chamar um administrador por favor?`,
                        components: []
                    })

                refreshButton()
                return interaction.update({
                    content: `${e.Animated.SaphireCry} | Pronto pronto, você não está mais participando deste sorteio.`,
                    components: []
                }).catch(() => { })
            })
            .catch(err => interaction.update({
                content: `${e.Animated.SaphirePanic} | Não foi possível te retirar do sorteio.\n${e.bug} | \`${err}\``,
                ephemeral: true
            }))
    }

    async function list() {

        return interaction.reply({
            content: `${e.Animated.SaphireDance} | Prontinho, é só clicar no botão.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Dados do Sorteio',
                            emoji: e.Animated.SaphireReading,
                            url: `${client.url}/giveaway?id=${giveaway.MessageID}&guildId=${guild.id}`,
                            style: ButtonStyle.Link
                        }
                    ]
                }
            ],
            ephemeral: true
        })

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