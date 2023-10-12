import { ApplicationCommandOptionType, Guild, Routes, codeBlock } from 'discord.js'
import { SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import pagesServerinfo from '../../functions/serverinfo/pages.serverinfo.js'

export default {
    name: 'serverinfo',
    description: '[util] Verifique as informações completadas de um servidor',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'search',
            description: 'Um servidor que eu esteja (Server ID também funciona)',
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ],
    api_data: {
        name: "serverinfo",
        description: "O comando mais poderoso que mostra todas as informações que é possível dentro de um servidor",
        category: "Utilidades",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }, commandData, isBack = false, toSend = false) {

        const { options } = interaction
        const guildId = commandData?.id || options.getString('search') || interaction.guild?.id

        if (commandData && !isBack && !toSend) return pagesServerinfo(interaction, commandData)

        const message = isBack
            ? await interaction.update({ content: `${e.Loading} | Voltando para o início...`, embeds: [], components: [], fetchReply: true }).catch(() => { })
            : await interaction.reply({ content: `${e.Loading} | Beleza! Carregando...`, fetchReply: true })

        const guild = await client.guilds.fetch(guildId).catch(async () => new Guild(client, await client.getGuild(guildId)))

        if (!guild)
            return isBack
                ? await interaction.update({ content: `${e.DenyX} | Nenhum servidor foi encontrado. Talvez eu não esteja nele.`, embeds: [], components: [], fetchReply: true }).catch(() => { })
                : await interaction.editReply({ content: `${e.DenyX} | Nenhum servidor foi encontrado. Talvez eu não esteja nele.`, fetchReply: true }).catch(() => { })

        const guildData = {
            bannerURL: guild.bannerURL({ size: 512 }) || guild.discoverySplashURL({ size: 512 }) || null,
            memberCount: guild.memberCount || 0,
            iconURL: guild.iconURL() || null,
            joinedAt: {
                first: Date.format(guild.joinedAt?.valueOf(), false, false),
                second: Date.stringDate(Date.now() - guild.joinedAt?.valueOf(), false)
            },
            guildOwner: await guild.fetchOwner()
                .then(member => member.user.username)
                .catch(async () => await guild.members.fetch(guild.ownerId || '0')
                    .then(member => member.user.username)
                    .catch(() => 'Owner Not Found'))
        }

        const fields = [
            {
                name: '📜 Servidor e Posse',
                value: `**${guild.name}**\n${e.OwnerCrow} **${guildData.guildOwner} \`${guild.ownerId}\`**`
            },
            {
                name: '🌟 A Fundação',
                value: `Nasceu em **\`${Date.format(guild.createdAt.valueOf(), false, false)}\`**\nExiste há **\`${Date.stringDate(Date.now() - guild.createdAt.valueOf())}\`**`
            }
        ]

        const whoAddMe = await client.rest.get(Routes.guildIntegrations(guildId))
            .then(res => {
                const data = res.find(d => d.account?.id == client.user?.id)
                if (!data) return ""
                return `\nFoi **${data.user.username}** que me adicionou no servidor.`
            })
            .catch(() => "")

        if (guildData.joinedAt.first)
            fields.push({
                name: `${e.Animated.SaphireSleeping} Minha Relação Com o Servidor`,
                value: `Cheguei aqui em **\`${guildData.joinedAt.first}\`**\n(**\`${guildData.joinedAt.second}\`**)${whoAddMe}`
            })

        if (guild.description)
            fields.push({
                name: '📝 Descrição do Servidor',
                value: codeBlock('txt', guild.description || 'Ok, não tem nada aqui')
            })

        const replyContent = {
            content: null,
            embeds: [{
                color: client.blue,
                title: '🔎 Informações do Servidor | INÍCIO',
                description: `Eai ${interaction.user}, tudo bom? Essa é a página principal de informações do servidor.`,
                thumbnail: { url: guildData.iconURL },
                image: { url: guildData.bannerURL },
                fields,
                footer: {
                    text: `Server ID: ${guild?.id}`,
                    iconURL: guildData.iconURL
                }
            }],
            components: [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: JSON.stringify({ c: 'serverinfo', id: guild?.id, uid: interaction.user?.id }),
                    placeholder: 'Mais Informações',
                    options: [
                        {
                            label: 'Página Inicial',
                            emoji: '⬅️',
                            description: 'A primeira das primeiras página',
                            value: 'firstPage'
                        },
                        {
                            label: 'Dados Numéricos',
                            emoji: '🔢',
                            description: 'Todos as contagens que podem ser contadas.',
                            value: 'numbers'
                        },
                        {
                            label: 'Imagens do Servidor',
                            emoji: '🖼️',
                            description: 'Icone, banner, discovery e convite do servidor',
                            value: 'images'
                        },
                        {
                            label: 'Dados Suplementares',
                            emoji: e.Info,
                            description: 'Dados importantes, mas nem tanto.',
                            value: 'suplement'
                        },
                        {
                            label: 'Recursos Liberados',
                            emoji: '💫',
                            description: 'Confira todos os recursos do servidor',
                            value: 'features'
                        },
                        {
                            label: 'Los Emojis',
                            emoji: e.amongusdance,
                            description: 'Os incríveis emojis desse servidor',
                            value: 'emojis'
                        },
                        {
                            label: 'Visualizar os Cargos',
                            emoji: '🔰',
                            description: 'Todos os cargos do servidor',
                            value: 'roles'
                        },
                        {
                            label: 'Atualizar',
                            emoji: "🔄",
                            description: 'Atualizar os dados no cache',
                            value: 'refresh'
                        }
                    ]
                }]
            }]
        }

        return message?.edit(replyContent).catch(() => { })

    }
}