import { ApplicationCommandOptionType, ButtonStyle, PermissionsBitField, ChannelType, AttachmentBuilder } from 'discord.js'
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
                ChannelType.AnnouncementThread,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildForum,
                ChannelType.GuildStageVoice,
                ChannelType.GuildText,
                ChannelType.GuildVoice,
                ChannelType.PrivateThread,
                ChannelType.PublicThread,
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
                },
                {
                    name: 'Apagar mensagens de webhooks',
                    value: 'webhooks'
                },
                {
                    name: 'Ignorar mensagens de bots',
                    value: 'ignoreBots'
                },
                {
                    name: 'Ignorar mensagens de membros',
                    value: 'ignoreMembers'
                }
            ]
        },
        {
            name: 'script',
            description: 'Receber um arquivo txt com o conteúdo das mensagens deletadas',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Sim, eu quero receber este arquivo.',
                    value: 'script'
                }
            ]
        },

    ],
    helpData: {
        description: 'Limpe rapidamente as mensagens',
        permissions: [DiscordPermissons.ManageMessages],
    },
    async execute({ interaction, e, guild, client }, commandData) {

        if (commandData) {
            const index = tempData.findIndex(obj => obj.idCode == commandData.idCode)
            if (index == -1)
                return interaction.update({ content: `${e.Deny} | Dados não encontrados. Por favor, tente novamente.`, components: [] })
            commandData = tempData[index]
            if (commandData.u !== interaction.user.id) return
            tempData.splice(index, 1)
        }

        if (!guild.members.me.permissions.has([DiscordPermissons.ManageMessages, DiscordPermissons.ReadMessageHistory], true))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **${PermissionsTranslate.ManageMessages}** & **${PermissionsTranslate.ManageMessages}** para executar este comando.`,
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
        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível obter o canal selecionado.`,
                ephemeral: true
            })

        const checkIfExistMessage = await channel.messages.fetch({ limit: 1 }).then(msg => msg.size).catch(err => err)
        if (checkIfExistMessage == 0) {
            const data = {
                content: `${e.Deny} | Não existe nenhuma mensagem ${channel.id == interaction.channel.id ? 'neste canal' : `no canal ${channel}`}.`,
                ephemeral: true
            }
            return commandData ? interaction.update(data).catch(() => { }) : interaction.reply(data)
        }

        if (checkIfExistMessage instanceof Error) {
            const content = {
                10008: `${e.Warn} | Alguma das mensagens acima é desconhecida ou o Discord está com lag.`,
                50013: `${e.Deny} | Eu não tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** ou **\`${PermissionsTranslate.ReadMessageHistory}\`** para executar este comando.`,
                50034: `${e.Warn} | As mensagens acima são velhas demais para eu apagar.`,
                50001: `${e.Warn} | Eu não tenho acesso as mensagens que foram solicitadas a exclusão. Por favor, verifique se eu tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** e **\`${PermissionsTranslate.ReadMessageHistory}\`**.`,
                50035: `${e.Warn} | Um valor acima do limite foi repassado.`
            }[checkIfExistMessage.code]
                || `${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, peça ajuda no meu servidor: ${Config.MoonServerLink}.\n${e.bug} | (${checkIfExistMessage.code}) \`${checkIfExistMessage}\``
            return commandData ? interaction.update({ content, ephemeral: true }).catch(() => { }) : interaction.reply({ content, ephemeral: true })
        }

        const member = commandData?.m ? await guild.members.fetch(commandData?.m).catch(() => null) : interaction?.options?.getMember('member')
        const bots = commandData?.b || interaction?.options?.getString('filter') == 'bots'
        const attachments = commandData?.a || interaction?.options?.getString('filter') == 'attachments'
        const webhooks = commandData?.w || interaction?.options?.getString('filter') == 'webhooks'
        const ignoreBots = commandData?.ignoreBots || interaction?.options?.getString('filter') == 'ignoreBots'
        const ignoreMembers = commandData?.ignoreMembers || interaction?.options?.getString('filter') == 'ignoreMembers'
        const script = commandData?.script || interaction?.options?.getString('script')

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
                    console.log(err)
                    return interaction.channel.send({
                        content: `${e.SaphireDesespero} | Houve um erro iniciar a execução do comando.\n${e.bug} | \`${err}\``,
                        components: []
                    }).catch(() => { })
                })
        }

        const filters = [
            member ? `👤 | Apagar as mensagens do membro ${member.displayName}.` : null,
            bots ? '🤖 | Apagar as mensagens de bots.' : null,
            attachments ? '📃 | Apagar mensagens com quaisquer tipo de mídia.' : null,
            webhooks ? '🛰️ | Apagar mensagens de webhooks.' : null,
            ignoreBots ? '🤖 | Ignorar as mensagens de bots.' : null,
            ignoreMembers ? '👤 | Ignorar mensagens de membros.' : null
        ].filter(i => i).join('\n')
            || '🧹 | Toma cuidado, nenhum filtro foi aplicado e eu vou passar a vassoura, viu?'

        const idCode = CodeGenerator(10)
        tempData.push({
            idCode, c: 'clear', u: interaction.user.id, ignoreMembers,
            ch: channel.id || '', b: bots, am: amount, ignoreBots,
            m: member?.id || '', a: attachments, w: webhooks, script
        })

        return await interaction.reply({
            content: `${e.QuestionMark} | Você está solicitando a exclusão de **${amount} mensagens** ${channel.id == interaction.channel.id ? '**neste canal**.' : `no canal ${channel}.`}\n${filters}\n📝 | *Eu não vou apagar alguns tipos de mensagens:\n**Mensagens fixadas, mais velhas que 14 dias, do sistema, notificações de boosters e mensagens com threads abertas***.`,
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
                size: 0, pinned: 0, older: 0, system: 0, ignored: 0, ignoreBots: 0, oldMessages: [],
                boost: 0, undeletable: 0, attachmentsMessages: 0, nonFilter: 0, Crossposted: 0,
                toFetchLimit: 0, looping: 0, MemberMessages: 0, botsMessages: 0, hasThread: 0,
                webhookMessages: 0, response: '', messagesCounterControl: amount, toDelete: [], script: []
            }

            while (control.messagesCounterControl !== 0) {

                if (control.toDelete.length) control.toDelete = []

                if (!channel.viewable) {
                    control.response += `${e.Deny} | Eu não tenho acesso ao canal ${channel}.`
                    break;
                }

                if (control.messagesCounterControl > 100)
                    control.toFetchLimit = 100
                else {
                    control.toFetchLimit = control.messagesCounterControl
                    control.messagesCounterControl = 0
                }

                if (control.toFetchLimit < 1 || control.toFetchLimit > 100) break;
                let messages = await channel.messages.fetch({ limit: 100 })
                    .catch(err => {
                        control.response += {
                            10008: `${e.Warn} | Alguma das mensagens acima é desconhecida ou o Discord está com lag.`,
                            50013: `${e.Deny} | Eu não tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** para executar este comando.`,
                            50034: `${e.Warn} | As mensagens acima são velhas demais para eu apagar.`,
                            50001: `${e.Warn} | Eu não tenho acesso as mensagens que foram solicitadas a exclusão. Por favor, verifique se eu tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** e **\`${PermissionsTranslate.ReadMessageHistory}\`**`,
                            50035: `${e.Warn} | Um valor acima do limite foi repassado.`
                        }[err.code]
                            || `${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, peça ajuda no meu servidor: ${Config.MoonServerLink}.\n${e.bug} | (${err.code}) \`${err}\``
                        control.response += '\n'
                        return null
                    })

                if (!messages) break;
                if (!messages.size && control.looping > 0) break;
                if (!messages.size && control.looping == 0)
                    return await interaction.channel.send({ content: `${e.Deny} | Este canal não possui nenhuma mensagem.` })
                        .catch(() => interaction.message.edit({ content: control.response, components: [] }).catch(() => { }))

                let disable = 0
                if (messages.size <= amount) disable++

                messages.sweep(msg => control.oldMessages.includes(msg.id))
                control.oldMessages.push(...messages.keys())

                control.size += messages.size
                control.pinned += messages.sweep(msg => msg.pinned)
                control.system += messages.sweep(msg => msg.system)
                control.boost += messages.sweep(msg => msg.roleSubscriptionData)
                control.hasThread += messages.sweep(msg => msg.hasThread)
                control.Crossposted += messages.sweep(msg => msg.Crossposted)
                control.older += messages.sweep(msg => !Date.Timeout(((1000 * 60 * 60) * 24) * 14, msg.createdAt.valueOf()))
                control.undeletable += messages.sweep(msg => !msg.deletable)

                if (ignoreBots)
                    control.ignoreBots += messages.sweep(msg => {
                        if (member?.user?.bot) msg?.author?.bot && msg?.author?.id !== member?.user?.id
                        return msg?.author?.bot
                    })

                if (ignoreMembers)
                    control.ignoreMembers += messages.sweep(msg => {
                        if (member) return !msg?.author?.bot && !msg?.webhookId && !msg?.system && msg?.author?.id !== member?.user?.id
                        return !msg?.author?.bot && !msg?.webhookId && !msg?.system
                    })

                if (messages.size <= amount) disable++
                if (amount < control.toFetchLimit) disable++

                if (!member && !bots && !attachments && !webhooks)
                    filterAndDefine(messages)

                if (member && bots) {
                    control.ignored += messages.sweep(msg => msg?.author?.id !== member.user.id && !msg?.author?.bot)
                    filterAndDefine(messages.filter(msg => msg?.author?.id == member.user.id), 'MemberMessages')
                    filterAndDefine(messages.filter(msg => msg?.author?.bot), 'botsMessages')
                }

                if (member && attachments) {
                    control.ignored += messages.sweep(msg => msg?.author?.id !== member.user.id && !msg?.attachments?.size && !msg?.files?.size)
                    filterAndDefine(messages.filter(msg => msg?.author?.id == member.user.id), 'MemberMessages')
                    filterAndDefine(messages.filter(msg => msg?.attachments?.size > 0 || msg?.files?.size > 0), 'attachmentsMessages')
                }

                if (member && webhooks) {
                    control.ignored += messages.sweep(msg => msg?.author?.id !== member.user.id && !msg?.webhookId)
                    filterAndDefine(messages.filter(msg => msg?.author?.id == member.user.id), 'MemberMessages')
                    filterAndDefine(messages.filter(msg => msg?.webhookId), 'webhookMessages')
                }

                if (member && !bots && !attachments && !webhooks) {
                    control.ignored += messages.sweep(msg => msg?.author?.id !== member.user.id)
                    filterAndDefine(messages.filter(msg => msg?.author?.id == member.user.id), 'MemberMessages')
                }

                if (!member && bots && !attachments && !webhooks) {
                    control.ignored += messages.sweep(msg => !msg?.author?.bot)
                    filterAndDefine(messages.filter(msg => msg.author.bot), 'botsMessages')
                }

                if (!member && !bots && attachments && !webhooks) {
                    control.ignored += messages.sweep(msg => msg?.attachments?.size == 0)
                    filterAndDefine(messages.filter(msg => msg?.attachments?.size > 0), 'attachmentsMessages')
                }

                if (!member && !bots && !attachments && webhooks) {
                    control.ignored += messages.sweep(msg => !msg?.webhookId)
                    filterAndDefine(messages.filter(msg => msg?.webhookId), 'webhookMessages')
                }

                if ((!messages?.size && !control.toDelete.length) && control.looping == 0) break;
                if ((!messages?.size && !control.toDelete.length) && control.looping > 0) continue;
                if (control.toDelete.length + counter > amount)
                    control.toDelete.length = amount - counter

                if (control.toDelete.every(id => typeof id == 'string')) {
                    control.response += `\n${e.Deny} | Alguma mensagem não condiz com o status de mensagem do Discord.`
                    control.toDelete = control.toDelete.filter(id => typeof id == 'string')
                }

                const messagesDeleted = await channel.bulkDelete(control.toDelete, true)
                    .catch(err => {
                        control.response += {
                            10008: `${e.Warn} | Alguma das mensagens acima é desconhecida ou o Discord está com lag.`,
                            50013: `${e.Deny} | Eu não tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** para executar este comando.`,
                            50034: `${e.Warn} | As mensagens acima são velhas demais para eu apagar.`,
                            50001: `${e.Warn} | Eu não tenho acesso as mensagens que foram solicitadas a exclusão. Por favor, verifique se eu tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** e **\`${PermissionsTranslate.ReadMessageHistory}\`**`,
                            50035: `${e.Warn} | Um valor acima do limite foi repassado.`
                        }[err.code]
                            || `${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, peça ajuda no meu servidor: ${Config.MoonServerLink}.\n${e.bug} | (${err.code}) \`${err}\``
                        control.response += '\n'
                        return null
                    })

                if (script)
                    messagesDeleted.forEach(msg => {
                        control.script.push({
                            userIdentificator: msg?.author?.tag ? `${msg?.author?.tag} (${msg?.author?.id})` : msg?.author?.id || 'ID Not Found',
                            content: msg?.content,
                            date: Date.format(msg.createdAt),
                            midias: msg?.attachments?.size || 0
                        })
                    })

                if (!messagesDeleted) break;
                counter += messagesDeleted.size
                control.messagesCounterControl -= messagesDeleted.size
                control.looping++
                control.toDelete = []
                if (counter >= amount || disable > 1) break;

                await sleep(2000)
                continue

                function filterAndDefine(collectionFiltered, collectionName) {
                    if (collectionFiltered.size == 0) return
                    const collectionToArrayFormat = collectionFiltered.toJSON().map(msg => msg.id).filter(i => i)

                    const toPush = collectionToArrayFormat.length > amount
                        ? collectionToArrayFormat.slice(0, amount)
                        : collectionToArrayFormat

                    for (let id of toPush)
                        if (id && !control.toDelete.includes(id)) {
                            if (control.toDelete.length >= amount) break;
                            if (collectionName) control[collectionName]++
                            control.toDelete.push(id)
                        } else continue

                    return
                }
            }

            control.response += `${e.Check} | ${interaction.user} pediu ${amount} e eu achei ${control.size} mensagens. Esse foi o resultado.\n`

            if (counter > 0)
                control.response += `${e.Trash} | ${counter}/${control.size} foi o total de mensagens excluídas.\n`

            for (const data of [
                { key: 'undeletable', text: `${e.Info} | ${control.undeletable} mensagens não podem ser deletadas por mim.` }, { key: 'undeletable', text: `${e.Info} | ${control.undeletable} mensagens não podem ser deletadas por mim.` },
                { key: 'system', text: `${e.Info} | ${control.system} mensagens do sistema não foram apagadas.` },
                { key: 'older', text: `📆 | ${control.older} mensagens são mais velhas que 14 dias.` },
                { key: 'pinned', text: `📌 | ${control.pinned} mensagens fixadas não foram apagadas.` },
                { key: 'hasThread', text: `💬 | ${control.hasThread} mensagens com threads abertas foram ignoradas.` },
                { key: 'Crossposted', text: `📢 | ${control.Crossposted} mensagens públicadas para outros servidores foram ignoradas.` },
                { key: 'ignoreBots', text: `🛰️ | ${control.ignoreBots} mensagens de bots foram ignoradas.` },
                { key: 'ignoreMembers', text: `👤 | ${control.ignoreMembers} mensagens de membros foram ignoradas.` },
                { key: 'MemberMessages', text: `👤 | ${control.MemberMessages} mensagens de ${member?.user?.tag || 'Not Found'} foram deletadas.` },
                { key: 'attachmentsMessages', text: `📃 | ${control.attachmentsMessages} mensagens com quaisquer tipo de mídia foram apagadas.` },
                { key: 'botsMessages', text: `🤖 | ${control.botsMessages} mensagens de bots foram apagadas.` },
                { key: 'webhookMessages', text: `🛰️ | ${control.webhookMessages} mensagens de webhooks foram apagadas.` },
                { key: 'ignored', text: `🪄 | ${control.ignored} mensagens foram ignoradas pelo filtro.` },
            ])
                if (control[data.key] > 0) control.response += data.text + '\n'

            const filters = [
                member ? `👤 | Apagar as mensagens do membro ${member.displayName}.` : null,
                bots ? '🤖 | Apagar as mensagens de bots.' : null,
                attachments ? '📃 | Apagar mensagens com quaisquer tipo de mídia.' : null,
                webhooks ? '🛰️ | Apagar mensagens de webhooks.' : null,
                ignoreBots ? '🤖 | Ignorar as mensagens de bots.' : null,
                ignoreMembers ? '👤 | Ignorar mensagens de membros.' : null
            ].filter(i => i).join('\n') || ''

            if (filters.length)
                control.response += `⬇️⬇️ Filtros Utilizados ⬇️⬇️\n${filters}`

            const files = await buildScript(control.script, filters) || []

            return await interaction.channel.send({ content: control.response, files })
                .catch(() => interaction.message.edit({ content: control.response, components: [] }).catch(() => { }))
        }

        async function buildScript(scriptData, filters) {
            if (!script || !scriptData.length) return []
            const text =
                `-------------------- ${client.user.username.toUpperCase()} CLEAR COMMAND REGISTER SCRIPT CONTENT --------------------
Solicitado por: ${interaction.user.tag} (${interaction.user.id})
Data deste Script: ${Date.format(new Date())}
Dados: Foram apagadas ${scriptData.length} mensagens no canal ${channel?.name || '??'} (${channel?.id || '0'})
${filters ? `${filters.length} Filtros Utlizados:\n${filters}` : 'Nenhum filtro foi utilizado'}

-------------------- MESSAGES REGISTER --------------------
${scriptData.map(data => `-- ${data.userIdentificator} - ${data.date || '00/00/0000 - 00:00'}\n${data.content || `${data.midias || '0'} Mídias nesta mensagem`}`).join('\n \n')}`
            try {
                const file = Buffer.from(text)
                const attachment = new AttachmentBuilder(file, { name: `${channel.name}_clear.txt`, description: 'Script Data Clear Content Resource' })
                return [attachment]
            } catch (err) {
                return []
            }

        }
    }
}