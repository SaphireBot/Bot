import { ButtonStyle, ChannelType, codeBlock, PermissionsBitField, Routes, StringSelectMenuInteraction } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { DiscordPermissons } from "../../../../util/Constants.js";
import { Emojis as e } from "../../../../util/util.js";

/**
 * @param { import("discord.js").APIGuild } guild
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

    const channels = await client.guilds.fetch(guild.id).then(g => g.channels?.cache?.toJSON()).catch(() => null)
        || await client.rest.get(Routes.guildChannels(guild.id)).catch(() => [])

    const integrations = await client.rest.get(Routes.guildIntegrations(guild.id)).catch(() => [])
    const bans = await client.rest.get(Routes.guildBans(guild.id)).then(b => b.length).catch(() => 0)
    const invites = await client.rest.get(Routes.guildInvites(guild.id)).catch(() => [])

    const data = {
        texts: channels.filter(ch => [ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(ch.type)).length || 0,
        categories: channels.filter(ch => ch.type == ChannelType.GuildCategory).length || 0,
        voices: channels.filter(ch => ch.type == ChannelType.GuildVoice).length || 0,
        stages: channels.filter(ch => ch.type == ChannelType.GuildStageVoice).length || 0,
        forums: channels.filter(ch => ch.type == ChannelType.GuildForum).length || 0,
        emojis: {
            animated: guild.emojis.filter(emoji => emoji.animated).length || 0,
            normal: guild.emojis.filter(emoji => !emoji.animated).length || 0,
            available: guild.emojis.filter(emoji => emoji.available).length || 0,
            unavailable: guild.emojis.filter(emoji => !emoji.available).length || 0
        },
        stickers: guild.stickers.length || 0,
        members: {
            online: guild?.approximate_presence_count || 0,
            max: guild.max_members || 0,
            banned: bans,
            bots: integrations.length || 0,
            total: `${guild?.approximate_member_count || 0}`
        },
        roles: {
            administrators: guild.roles.filter(role => new PermissionsBitField(role.permissions).has(DiscordPermissons.Administrator)).length || 0,
            total: guild.roles.length
        },
        boost: {
            premiumSubscriptionCount: guild.premium_subscription_count || 0,
            premiumTier: {
                1: "1",
                2: "2",
                3: "3 (Max)"
            }[guild.premium_tier] || "0"
        },
        invites: {
            amount: invites.length || 0,
            uses: invites.reduce((acc, invite) => acc += invite.uses, 0) || 0,
            permanents: invites.filter(invite => invite.temporary).length || 0,
            temporary: invites.filter(invite => !invite.temporary).length || 0
        },
        others: {
            maxStageChannelUsers: `${guild.max_stage_video_channel_users || 0} per/chat`,
            maximumMembers: guild.max_members || 0,
            maxVideoChannelUsers: `${guild.max_video_channel_users || 0} per/chat`,
            nsfwLevel: guild.nsfw_level,
            afkTimeout: `${guild.afk_timeout} segundos`
        }
    }

    return interaction.message.edit({
        embeds: [{
            color: client.blue,
            title: '🔎 Informações do Servidor | NÚMEROS',
            description: `${e.Animated.SaphireReading} Aqui é onde fica os números do servidor.`,
            fields: [
                {
                    name: '💭 Central dos Canais',
                    value: codeBlock('txt', `Categorias: ${data.categories}\nTexto: ${data.texts}\nVoz: ${data.voices}\nPalco: ${data.stages}\nFóruns: ${data.forums}`),
                    inline: true
                },
                {
                    name: '👥 Membros',
                    value: codeBlock('txt', `Online: ${data.members.online}\nMáximo: ${data.members.max}\nBanidos: ${data.members.banned}\nBots: ${data.members.bots}\nTotal: ${data.members.total}`),
                    inline: true
                },
                {
                    name: '😀 Emojis/Stickers',
                    value: codeBlock('txt', `Animados: ${data.emojis.animated}\nNormais: ${data.emojis.normal}\nTotais: ${data.emojis.animated + data.emojis.normal}\nDisponíveis: ${data.emojis.available}\nIndisponíveis: ${data.emojis.unavailable}\nStickers: ${data.stickers}\nTotal: ${guild.emojis.length + guild.stickers.length}`),
                    inline: false
                },
                {
                    name: '🔰 Os Carguinhos',
                    value: codeBlock('txt', `Admins: ${data.roles.administrators}\nTotal: ${data.roles.total}`),
                    inline: true
                },
                {
                    name: `${e.Boost} Los Impulsos`,
                    value: codeBlock('txt', `Boosters: ${data.boost.premiumSubscriptionCount}\nNível: ${data.boost.premiumTier}`),
                    inline: true
                },
                {
                    name: '📨 Convites',
                    value: codeBlock('txt', `Total: ${data.invites.amount}\nUsos: ${data.invites.uses}\nPermanentes: ${data.invites.permanents}\nTemporários: ${data.invites.temporary}`),
                    inline: false
                },
                {
                    name: '📋 Outros',
                    value: codeBlock('txt', `Membros Max: ${data.others.maximumMembers}\nStreams Users Max: ${data.others.maxVideoChannelUsers}\nStage Users Max: ${data.others.maxStageChannelUsers}\nNSFW Level: ${data.others.nsfwLevel}\nAFK Timeout: ${data.others.afkTimeout}`),
                    inline: false
                }
            ],
            footer: {
                text: `Server ID: ${guild.id}`,
                iconURL: guild.icon
                    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.includes('a_') ? 'gif' : 'png'}`
                    : null
            }
        }],
        components: [components]
    }).catch(() => { })
}