import { AttachmentBuilder, ButtonStyle } from "discord.js"
import { Database, GiveawayManager } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { writeFileSync, readFileSync, rm } from "fs"
import { CodeGenerator } from "../../../../functions/plugins/plugins.js"
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async ({ interaction }, commandData) => {

    const { src } = commandData
    if (src == 'ignore') return ignore()

    const { guild, user, message, channel, member } = interaction
    const gwId = commandData?.gwId || message.id
    const index = GiveawayManager.giveaways.findIndex(g => g.MessageID == gwId)
    let giveaway = GiveawayManager.giveaways[index]

    if (!giveaway) {
        const index = GiveawayManager.awaiting.findIndex(g => g.MessageID == gwId)
        giveaway = GiveawayManager.awaiting[index]
    }

    if (index == -1 || !giveaway)
        return await interaction.reply({
            content: `${e.SaphireWhat} | O sorteio não foi encontrado. Por favor, tente daqui alguns segundos ou fale com um administrador.`,
            ephemeral: true
        })

    const execute = { join, list, leave }[src]

    if (execute) return execute()

    return await interaction.reply({ content: `${e.bug} | Nenhuma sub-função encontrada. #18564846`, ephemeral: true })

    async function join() {

        if (giveaway.Participants.includes(user.id))
            return askToLeave()

        if (giveaway.AllowedRoles?.length) {
            const memberRolesIds = member.roles.cache.map(role => role.id)
            if (!giveaway.AllowedRoles.every(id => memberRolesIds.includes(id)))
                return await interaction.reply({
                    content: `${e.DenyX} | Poooxa, que pena. Você não tem todos os cargos obrigatórios para entrar neste sorteio.\n${e.Info} | Pra você entrar, falta esses cargos: ${giveaway.AllowedRoles.filter(roleId => !memberRolesIds.includes(roleId)).map(roleId => `<@&${roleId}>`).join(', ')}`,
                    ephemeral: true
                })
        }

        if (!giveaway.AllowedMembers?.includes(user.id))
            return await interaction.reply({
                content: `${e.cry} | Você não está na lista de pessoas que podem entrar no sorteio.`,
                ephemeral: true
            })

        giveaway.Participants.push(user.id)
        await Database.Guild.updateOne(
            { id: guild.id, 'Giveaways.MessageID': message.id },
            { $push: { 'Giveaways.$.Participants': user.id, } }
        )

        refreshButton()
        return await interaction.reply({
            content: `${e.CheckV} | Aeee ${e.Tada}, coloquei você na lista de participantes, agora é só esperar o sorteio terminar. Boa sorte`,
            ephemeral: true
        })
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
                            custom_id: JSON.stringify({ c: 'giveaway', src: 'leave', gwId: message.id }),
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
            content: `${e.Check} | Ok, vamos fingir que nada aconteceu por aqui.`,
            components: []
        }).catch(() => { })
    }

    async function leave() {

        if (!giveaway.Participants.includes(user.id))
            return await interaction.update({
                content: `${e.cry} | Você não está participando deste sorteio.`,
                components: []
            }).catch(() => { })

        giveaway.Participants.splice(
            giveaway.Participants.findIndex(id => id == user.id), 1
        )

        await Database.Guild.updateOne(
            { id: guild.id, 'Giveaways.MessageID': message.id },
            { $pull: { 'Giveaways.$.Participants': user.id } }
        )

        refreshButton()
        return await interaction.update({
            content: `${e.cry} | Pronto pronto, você não está mais participando deste sorteio.`,
            components: []
        }).catch(() => { })
    }

    async function list() {

        const participants = giveaway.Participants || []

        await interaction.reply({ content: `${e.Loading} | Ok, só um segundo...`, ephemeral: true }).catch(() => { })

        await guild.members.fetch()
        const participantsMapped = participants.length > 0
            ? participants
                .map((id, i) => `${i + 1}. ${guild.members.cache.get(id)?.user?.tag || 'User Not Found'} (${id})`)
                .join('\n')
            : '~~ Ninguém ~~'

        const fileName = `${CodeGenerator(7)}.${user.id}.txt`

        writeFileSync(
            fileName,
            `Dados do Sorteio ${gwId}
Servidor: ${guild.name}
Lançado por: ${guild.members.cache.get(giveaway.Sponsor)?.user?.tag || 'User Not Found'} (${giveaway.Sponsor})
Prêmio: ${giveaway.Prize}
Tempo de Espera: ${Date.stringDate(giveaway.TimeMs)}
Data Prevista para Disparo: ${Date.format(giveaway.DateNow + giveaway.TimeMs, false, false)}
Data de Disparo: ${giveaway.DischargeDate ? Date.format(giveaway.DateNow + giveaway.TimeMs, false, false) : 'Não disparado ainda'}
Data de Criação Deste Registro: ${Date.format(Date.now(), false, false)}
--------------------------------------------------------------
${giveaway.AllowedMembers.length || '0'} Usuários Permitidos:\n${giveaway.AllowedMembers.length ? giveaway.AllowedMembers.map(id => `${guild.members.cache.get(id)?.user?.tag || 'User Not Found'} (${id})`).join('\n') : '~~ Nenhum ~~'}
--------------------------------------------------------------
${giveaway.AllowedRoles.length || '0'} Cargos Obrigatórios:\n${giveaway.AllowedRoles.length ? giveaway.AllowedRoles.map(id => `${guild.roles.cache.get(id)?.name || 'Role Name Not Found'} (${id})`).join('\n') : '~~ Nenhum ~~'}
--------------------------------------------------------------
${giveaway.Participants?.length || '0'} Participantes Por Ordem de Entrada:\n${participantsMapped}`,
            { encoding: 'utf8' })
        await delay(1000)

        try {
            const buffer = readFileSync(fileName)
            const attachment = new AttachmentBuilder(buffer, { name: `participants.txt`, description: `Lista de participantes do sorteio ${gwId}` })
            await interaction.editReply({ content: null, files: [attachment] }).catch(() => { })
            return rm(fileName, (err) => {
                if (err) return console.log(`Não foi possível remover o arquivo.txt: \`${fileName}\``)
            })
        } catch (err) {
            return await interaction.editReply({ content: `${e.Info} | Tive um pequeno problema na autenticação da lista de usuários. Por favor, tente novamente daqui uns segundos.`, }).catch(() => { })
        }

    }

    function refreshButton() {
        const components = message?.components[0]?.toJSON()
        if (components) components.components[0].label = `Participar (${giveaway.Participants.length})`
        return message.edit({ components: [components] })
            .catch(async err => {
                if (err.code == 10008) {
                    const msg = await channel.messages.fetch(gwId || '0').catch(() => null)
                    const components = msg?.components[0]?.toJSON()
                    if (components) components.components[0].label = `Participar (${giveaway.Participants.length})`
                    if (msg) return msg.edit({ components: [components] })
                    return
                }
                return;
            })
    }

}