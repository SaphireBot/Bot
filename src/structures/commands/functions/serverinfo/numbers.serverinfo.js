import { ButtonStyle, ChannelType, codeBlock, Guild, StringSelectMenuInteraction } from "discord.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { DiscordPermissons } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { Guild } guild
 * @param { StringSelectMenuInteraction } interaction
 */
export default async (interaction, guild) => {

    const indexComponent = interaction.message.components.length > 1 ? 1 : 0
    const components = interaction.message.components[indexComponent].toJSON()

    await interaction.update({
        components: [{
            type: 1,
            components: [{
                type: 2,
                label: 'Carregando...',
                emoji: e.Loading,
                custom_id: 'loading',
                style: ButtonStyle.Secondary,
                disabled: true
            }]
        }]
    }).catch(() => { })

    await Promise.all([
        guild.fetch().catch(() => null),
        guild.members.fetch().catch(() => null),
        guild.roles.fetch().catch(() => null),
        guild.bans.fetch().catch(() => null),
        guild.invites.fetch().catch(() => null),
    ])

    const channels = guild.channels.cache.toJSON()

    const data = {
        texts: channels.filter(ch => [ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(ch.type)).length || 0,
        categories: channels.filter(ch => ch.type == ChannelType.GuildCategory).length || 0,
        voices: channels.filter(ch => ch.type == ChannelType.GuildVoice).length || 0,
        stages: channels.filter(ch => ch.type == ChannelType.GuildStageVoice).length || 0,
        forums: channels.filter(ch => ch.type == ChannelType.GuildForum).length || 0,
        emojis: {
            animated: guild.emojis.cache.filter(emoji => emoji.animated).size || 0,
            normal: guild.emojis.cache.filter(emoji => !emoji.animated).size || 0
        },
        stickers: guild.stickers.cache.size || 0,
        members: {
            // online: guild.members.cache.filter(member => member.presence?.status == 'online').size || 0,
            // idle: guild.members.cache.filter(member => member.presence?.status == 'idle').size || 0,
            // dnd: guild.members.cache.filter(member => member.presence?.status == 'dnd').size || 0,
            // offline: guild.members.cache.filter(member => member.presence?.status == 'offline').size || 0,
            online: 0,
            idle: 0,
            dnd: 0,
            // offline: 0, Tá offline, bruh...
            bots: guild.members.cache.filter(member => member.user.bot).size || 0,
            total: guild.members.cache.size || 0
        },
        roles: {
            administrators: guild.roles.cache.filter(role => role.permissions.has(DiscordPermissons.Administrator)).toJSON(),
            total: guild.roles.cache.size
        },
        boost: {
            premiumSubscriptionCount: guild.premiumSubscriptionCount || 0,
            premiumTier: guild.premiumTier || 0
        },
        autoMod: {
            enables: guild.autoModerationRules?.cache?.filter(automod => automod?.enabled).size || 0,
            disabled: guild.autoModerationRules?.cache?.filter(automod => !automod?.enabled).size || 0
        },
        bans: {
            withReason: guild.bans.cache.filter(ban => ban.reason).size || 0,
            withoutReason: guild.bans.cache.filter(ban => !ban.reason).size || 0
        },
        invites: {
            amount: guild.invites.cache.size || 0,
            uses: guild.invites.cache.reduce((acc, invite) => acc += invite.uses, 0) || 0,
            permanents: guild.invites.cache.filter(invite => invite.expiresAt === null).size || 0,
            temporary: guild.invites.cache.filter(invite => invite.expiresAt !== null).size || 0
        },
        others: {
            bitrate: `${guild.maximumBitrate || 0}kb/s`,
            maximumMembers: guild.maximumMembers || 0,
            maxVideoChannelUsers: `${guild.maxVideoChannelUsers || 0} per/chat`
        },
        scheduledEvents: guild.scheduledEvents.cache.size || 0
    }

    return await interaction.message.edit({
        embeds: [{
            color: client.blue,
            title: '🔎 Informações do Servidor | NÚMEROS',
            description: `${e.saphireLendo} Aqui é onde fica os números do servidor.`,
            fields: [
                {
                    name: '💭 Central dos Canais',
                    value: codeBlock('txt', `Categorias: ${data.categories}\nTexto: ${data.texts}\nVoz: ${data.voices}\nPalco: ${data.stages}\nFóruns: ${data.forums}`),
                    inline: true
                },
                {
                    name: '😀 Emojis/Stickers',
                    value: codeBlock('txt', `Animados: ${data.emojis.animated}\nNormais: ${data.emojis.normal}\nTotais: ${data.emojis.animated + data.emojis.normal}\nStickers: ${data.stickers}\nTotal: ${data.emojis.animated + data.emojis.normal + data.stickers}`),
                    inline: true
                },
                {
                    name: '👥 Membros*',
                    value: codeBlock('txt', `Online: ${data.members.online}\nAusente: ${data.members.idle}\nNão Perturbar: ${data.members.idle}\nBots: ${data.members.bots}\nTotal: ${data.members.total}`),
                    inline: true
                },
                {
                    name: '🔰 Os Carguinhos',
                    value: codeBlock('txt', `Admins: ${data.roles.administrators.length}\nTotal: ${data.roles.total}`),
                    inline: true
                },
                {
                    name: `${e.Boost} Los Impulsos`,
                    value: codeBlock('txt', `Boosters: ${data.boost.premiumSubscriptionCount}\nNível: ${data.boost.premiumTier}`),
                    inline: true
                },
                {
                    name: '🔨 Banimentos',
                    value: codeBlock('txt', `Com Motivo: ${data.bans.withReason}\nSem Motivo: ${data.bans.withoutReason}`),
                    inline: true
                },
                {
                    name: '📋 Outros',
                    value: codeBlock('txt', `Bitrate: ${data.others.bitrate}\nMembros Max: ${data.others.maximumMembers}\nVídeo Voice Max: ${data.others.maxVideoChannelUsers}\nEventos Ativos: ${data.scheduledEvents}`),
                    inline: true
                },
                {
                    name: '📨 Convites',
                    value: codeBlock('txt', `Total: ${data.invites.amount}\nUsos: ${data.invites.uses}\nPermanentes: ${data.invites.permanents}\nTemporários: ${data.invites.temporary}`),
                    inline: true
                },
                {
                    name: '📋 * Observação',
                    value: codeBlock('txt', `A contagem de membros por status ainda não é possível. Por causa da Saphire ser verificada, ela precisa de uma Intent que não tem. Já solicitei ao Discord e estou aguardando a liberação.\n~ Rody, Desenvolvedor da Saphire Moon.`),
                }
            ],
            footer: {
                text: `Server ID: ${guild.id}`,
                iconURL: guild.iconURL() || null
            }
        }],
        components: [components]
    }).catch(() => { })
}