import { ApplicationCommandOptionType, ButtonStyle, PermissionsBitField, ChannelType } from 'discord.js'
import { Config, DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js'
import { CodeGenerator } from '../../../../functions/plugins/plugins.js';
import { setTimeout as sleep } from 'node:timers/promises';
let tempData = []

export default {
    name: 'clear',
    description: '[moderation] Limpe mensagens rapidamente no chat',
    dm_permission: false,
    default_member_permissions: `${PermissionsBitField.Flags.ManageMessages}`,
    type: 1,
    name_localizations: { "en-US": "clear", 'pt-BR': 'limpar' },
    database: false,
    options: [
        {
            name: 'amount',
            name_localizations: { 'pt-BR': 'quantidade' },
            type: ApplicationCommandOptionType.Integer,
            description: 'Quantidade de mensagens a ser deletadas (1~100)',
            min_value: 1,
            max_value: 1000,
            required: true
        },
        {
            name: 'member',
            name_localizations: { 'pt-BR': 'membro' },
            description: 'Membro que terá as mensagens deletadas',
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'channel',
            name_localizations: { 'pt-BR': 'canal' },
            description: 'Canal que terá as mensagens deletadas',
            type: ApplicationCommandOptionType.Channel,
            channel_types: [
                ChannelType.GuildText,
                ChannelType.AnnouncementThread,
                ChannelType.GuildAnnouncement,
                ChannelType.PublicThread
            ]
        },
        {
            name: 'filter',
            name_localizations: { 'pt-BR': 'filtro' },
            description: 'Aplicar um filtro nas mensagens',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Apagar mensagens de Bots',
                    value: 'bots'
                },
                {
                    name: 'Apagar mensagens com arquivos/fotos/gifs',
                    value: 'attachments'
                }
            ]
        },
    ],
    helpData: {
        description: 'Limpe rapidamente as mensagens',
        permissions: [DiscordPermissons.ManageMessages],
    },
    async execute({ interaction, e, guild }, commandData) {

        if (commandData) {
            const index = tempData.findIndex(obj => obj.idCode == commandData.idCode)
            if (index == -1)
                return interaction.update({ content: `${e.Deny} | Dados não encontrados. Por favor, tente novamente.`, components: [] })
            commandData = tempData[index]
            if (commandData.u !== interaction.user.id) return
            tempData.splice(index, 1)
        }

        if (!guild.members.me.permissions.has(DiscordPermissons.ManageMessages, true))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **${PermissionsTranslate.ManageMessages}** para executar este comando.`,
                ephemeral: true
            })

        if (!interaction.member.permissions.has(DiscordPermissons.ManageMessages, true))
            return await interaction.reply({
                content: `${e.Deny} | Você precisa da permissão **${PermissionsTranslate.ManageMessages}** para executar este comando.`,
                ephemeral: true
            })

        const amount = commandData?.am || interaction.options.getInteger('amount')
        if (amount <= 0 || amount > 1000)
            return await interaction.reply({ content: `${e.Deny} | A quantidade de mensagens a ser apagadas tem que estar entre 0 e 1000.`, ephemeral: true })

        const channel = guild.channels.cache.get(commandData?.ch) || interaction?.options?.getChannel('channel') || interaction.channel
        const member = commandData?.m ? await guild.members.fetch(commandData?.m).catch(() => null) : interaction?.options?.getMember('member')
        const bots = commandData?.b || interaction?.options?.getString('filter') == 'bots'
        const attachments = commandData?.a || interaction?.options?.getString('filter') == 'attachments'

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Huuuum... Não achei canal nenhum...`,
                ephemeral: true
            })

        if (!channel.viewable)
            return await interaction.reply({
                content: `${e.Deny} | Epa! Não tenho permissão para acessar esse canal.`,
                ephemeral: true
            })

        if (commandData?.m && !member)
            return await interaction.update({
                content: `${e.SaphireDesespero} | Oshhh... Eu vi que você marcou um membro, mas eu não achei ele no servidor...`,
                components: []
            })

        if (commandData) {
            return interaction.message.delete()
                .then(() => deleteMessages())
                .catch(err => {
                    return interaction.message.edit({
                        content: `${e.bug} | Houve um erro iniciar a execução do comando.\n${e.bug} | #${err.code} \`${err}\``,
                        components: []
                    }).catch(() => { })
                })
        }

        const filters = [
            member ? `👤 | Apagar as mensagens do membro ${member.displayName}.` : null,
            bots ? '🤖 | Apagar as mensagens de bots.' : null,
            attachments ? '📃 | Apagar mensagens com quaisquer tipo de mídia.' : null
        ].filter(i => i).join('\n') || ''

        const idCode = CodeGenerator(10)
        tempData.push({
            idCode, c: 'clear', u: interaction.user.id,
            ch: channel.id || '', b: bots, am: amount,
            m: member?.id || '', a: attachments
        })

        return await interaction.reply({
            content: `${e.QuestionMark} | Você está solicitando a exclusão de **${amount} mensagens** ${channel.id == interaction.channel.id ? '**neste canal**.' : `no canal ${channel}.`}${filters ? `\n${filters}` : '\n🧹 | Toma cuidado, nenhum filtro foi aplicado e eu vou passar a vassoura, viu?'}\n📝 | *Eu não vou apagar mensagens **que estão fixadas, mais velhas que 14 dias, do sistema e de boosters***.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Confirmar Exclusão',
                            emoji: e.Trash,
                            custom_id: JSON.stringify({ c: 'clear', idCode: idCode }),
                            style: ButtonStyle.Danger
                        },
                        {
                            type: 2,
                            label: 'Cancelar Comando',
                            emoji: '✖️',
                            custom_id: JSON.stringify({ c: 'delete' }),
                            style: ButtonStyle.Success
                        }
                    ]
                }
            ]
        })

        async function deleteMessages() {

            let counter = 0
            const control = {
                size: 0, pinned: 0, older: 0, system: 0, ignored: 0,
                boost: 0, undeletable: 0, attachmentsMessages: 0,
                toFetchLimit: 0, looping: 0, MemberMessages: 0, botsMessages: 0,
                response: '', messagesCounterControl: amount
            }

            while (control.messagesCounterControl !== 0) {

                if (!channel.viewable) {
                    control.response += `${e.Deny} | Eu não tenho acesso ao canal ${channel}.`
                    break;
                }

                if (control.messagesCounterControl > 100) {
                    control.toFetchLimit = 100
                } else {
                    control.toFetchLimit = control.messagesCounterControl
                    control.messagesCounterControl = 0
                }

                if (member) control.toFetchLimit = 100

                if (control.toFetchLimit < 1 || control.toFetchLimit > 100) break;
                let messages = await channel.messages.fetch({ limit: control.toFetchLimit })
                    .catch(err => {
                        control.response += {
                            10008: `${e.Warn} | Alguma das mensagens acima é desconhecida ou o Discord está com lag.`,
                            50013: `${e.Deny} | Eu não tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** para executar este comando.`,
                            50034: `${e.Warn} | As mensagens acima são velhas demais para eu apagar.`,
                            50001: `${e.Warn} | Eu não tenho acesso as mensagens que foram solicitadas a exclusão.`
                        }[err.code]
                            || `${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`/bug\` ou entre no [meu servidor](${Config.MoonServerLink}).\n${e.bug} | (${err.code}) \`${err}\``
                        control.response += '\n'
                        return null
                    })

                if (!messages) break
                if (!messages.size && control.looping > 0) break;
                if (!messages.size && control.looping == 0)
                    return await interaction.channel.send({ content: `${e.Deny} | Este canal não possui nenhuma mensagem.` })
                        .catch(() => interaction.message.edit({ content: control.response, components: [] }).catch(() => { }))

                let disable = 0
                if (messages.size <= amount) disable++

                control.size += messages.size
                control.pinned += messages.sweep(msg => msg.pinned)
                control.system += messages.sweep(msg => msg.system)
                control.boost += messages.sweep(msg => msg.roleSubscriptionData)
                control.older += messages.sweep(msg => !Date.Timeout(((1000 * 60 * 60) * 24) * 14, msg.createdAt.valueOf()))
                control.undeletable += messages.sweep(msg => !msg.deletable)

                if (messages.size <= amount) disable++
                if (amount < control.toFetchLimit) disable++

                if (member && bots) {
                    control.MemberMessages += messages.filter(msg => msg?.author?.id == member.user.id).size
                    control.botsMessages += messages.filter(msg => msg?.author?.bot).size
                    control.ignored += messages.sweep(msg => msg?.author?.id !== member.user.id && !msg?.author?.bot)
                }

                if (member && attachments) {
                    control.MemberMessages += messages.filter(msg => msg?.author?.id == member.user.id).size
                    control.attachmentsMessages += messages.filter(msg => msg?.attachments?.size > 0 || msg?.files?.size > 0).size
                    control.ignored += messages.sweep(msg => msg?.author?.id !== member.user.id && !msg?.attachments?.size && !msg?.files?.size)
                }

                if (!member && bots && !attachments) {
                    control.botsMessages += messages.filter(msg => msg?.author?.bot).size
                    control.ignored += messages.sweep(msg => !msg?.author?.bot)
                }

                if (!member && !bots && attachments) {
                    control.attachmentsMessages += messages.filter(msg => msg?.attachments?.size || msg?.files?.size).size
                    control.ignored += messages.sweep(msg => !msg?.attachments?.size || !msg?.files?.size)
                }

                if (member && !bots && !attachments) {
                    control.ignored += messages.sweep(msg => msg?.author?.id !== member.user.id)
                    if (messages.size > amount) {
                        let data = messages.toJSON()
                        messages = data.slice(0, amount).map(msg => msg.id)
                        control.MemberMessages = messages.length
                    } else control.MemberMessages += messages.filter(msg => msg?.author?.id == member.user.id).size
                }

                if ((!messages?.size && !messages?.length) && control.looping == 0) break;
                if ((!messages?.size && !messages?.length) && control.looping > 0) continue;

                const messagesDeleted = await channel.bulkDelete(messages, true)
                    .catch(err => {
                        control.response += {
                            10008: `${e.Warn} | Alguma das mensagens acima é desconhecida ou o Discord está com lag.`,
                            50013: `${e.Deny} | Eu não tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** para executar este comando.`,
                            50034: `${e.Warn} | As mensagens acima são velhas demais para eu apagar.`,
                            50001: `${e.Warn} | Eu não tenho acesso as mensagens que foram solicitadas a exclusão.`
                        }[err.code]
                            || `${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`/bug\` ou entre no [meu servidor](${Config.MoonServerLink}).\n${e.bug} | (${err.code}) \`${err}\``
                        control.response += '\n'
                        return null
                    })

                if (!messagesDeleted) break
                counter += messagesDeleted.size
                control.messagesCounterControl -= messagesDeleted.size
                control.looping++
                if (counter >= amount || disable > 1) break;
                await sleep(2000)
            }

            control.response += `${e.Check} | ${interaction.user} pediu ${amount} e eu achei ${control.size} mensagens. Esse foi o resultado.\n${e.Trash} | ${counter}/${control.size} foi o total de mensagens excluídas.`
            for (const data of [
                { key: 'undeletable', text: `\n${e.Info} | ${control.undeletable} mensagens não podem ser deletadas por mim.` },
                { key: 'system', text: `\n${e.Info} | ${control.system} mensagens do sistema não foram apagadas.` },
                { key: 'older', text: `\n📆 | ${control.older} mensagens são mais velhas que 14 dias.` },
                { key: 'pinned', text: `\n📌 | ${control.pinned} mensagens fixadas não foram apagadas.` },
                { key: 'MemberMessages', text: `\n👤 | ${control.MemberMessages} mensagens de ${member?.user?.tag || 'Not Found'} foram deletadas.` },
                { key: 'attachmentsMessages', text: `\n📃 | ${control.attachmentsMessages} mensagens com quaisquer tipo de mídia foram apagadas.` },
                { key: 'botsMessages', text: `\n🤖 | ${control.botsMessages} mensagens de bots foram apagadas.` },
                { key: 'ignored', text: `\n🪄 | ${control.ignored} mensagens foram ignoradas pelo filtro.` },
            ])
                if (control[data.key] > 0) control.response += data.text
            return await interaction.channel.send({ content: control.response })
                .catch(() => interaction.message.edit({ content: control.response, components: [] }).catch(() => { }))
        }

    }
}