import { StringSelectMenuInteraction, Guild, ButtonStyle, codeBlock } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { locales } from "../../../../util/Constants.js";
import { Emojis as e } from "../../../../util/util.js";

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { Guild } guild
 */
export default async (interaction, guild) => {

    const indexComponent = interaction.message.components.length > 1 ? 1 : 0
    const selectMenu = interaction.message.components[indexComponent].toJSON()

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

    const sameGuild = guild.id == interaction.guild.id
        ? true
        : await guild.members.fetch(interaction.user.id).then(() => true).catch(() => false)

    const data = {
        afkChannel: guild.afkChannel ? `${sameGuild ? `${guild.afkChannel} (${Date.stringDate(guild.afkTimeout * 1000)})\n\`${guild.afkChannelId}\`` : codeBlock('txt', `${guild.afkChannel.name}(${Date.stringDate(guild.afkTimeout * 1000)})\n${guild.afkChannelId}`)}` : codeBlock('txt', 'Nenhum Canal\n-----------'),
        publicUpdatesChannel: formatChannel(guild.publicUpdatesChannel, guild.publicUpdatesChannelId),
        rulesChannel: formatChannel(guild.rulesChannel, guild.rulesChannelId),
        systemChannel: formatChannel(guild.systemChannel, guild.systemChannelId),
        defaultMessageNotifications: {
            0: 'Todas as mensagens',
            1: 'Apenas @menções'
        }[guild.defaultMessageNotifications],
        explicitContentFilter: {
            0: 'Desativado',
            1: 'Membros sem cargos',
            2: 'Todos os membros'
        }[guild.explicitContentFilter],
        nameAndId: `${guild.name} \n${guild.id} `,
        ownerAndId: `${(await guild.members.fetch(guild.ownerId)?.then(member => member.user.username).catch(() => 'Not Found'))} \n${guild.ownerId} `,
        large: guild.large ? 'Sim' : 'Não',
        mfaLevel: guild.mfaLevel ? 'Ativado' : 'Desativado',
        nameAcronym: guild.nameAcronym ? guild.nameAcronym : 'Não Possui',
        nsfwLevel: {
            0: 'Padrão',
            1: 'Explícito',
            2: 'Seguro',
            3: 'Restrito à Idade'
        }[guild.nsfwLevel],
        partnered: guild.partnered ? 'Sim' : 'Não',
        preferredLocale: locales[guild.preferredLocale] || guild.preferredLocale,
        premiumProgressBarEnabled: guild.premiumProgressBarEnabled ? 'Ativado' : 'Desativado',
        vanityURLCode: guild.vanityURLCode ? guild.vanityURLCode : 'Nenhum Código',
        verificationLevel: {
            0: 'Nenhum',
            1: 'Baixo',
            2: 'Médio',
            3: 'Alta',
            4: 'Mais alta'
        }[guild.verificationLevel],
        verified: guild.verified ? 'Sim' : 'Não'
    }

    const fields = [
        {
            name: '💤 Canal AFK',
            value: data.afkChannel,
            inline: true
        },
        {
            name: '📭 Canal de Updates',
            value: data.publicUpdatesChannel,
            inline: true
        },
        {
            name: '📑 Canal de Regras',
            value: data.rulesChannel,
            inline: true
        },
        {
            name: '⚙️ Canal do Sistema',
            value: data.systemChannel,
            inline: true
        },
        {
            name: '📝 Nome & ID',
            value: codeBlock('txt', data.nameAndId),
            inline: true
        },
        {
            name: `${e.OwnerCrow} The Boss`,
            value: codeBlock('txt', data.ownerAndId),
            inline: true
        },
        {
            name: `${e.Notification} Notificação`,
            value: codeBlock('txt', data.defaultMessageNotifications),
            inline: true
        },
        {
            name: '👮 Conteúdo Explícito',
            value: codeBlock('txt', data.explicitContentFilter),
            inline: true
        },
        {
            name: '📡 Servidor Lotado',
            value: codeBlock('txt', data.large),
            inline: true
        },
        {
            name: '📲 Autenticador 2FA',
            value: codeBlock('txt', data.mfaLevel),
            inline: true
        },
        {
            name: '🅰️ Sigla',
            value: codeBlock('txt', data.nameAcronym),
            inline: true
        },
        {
            name: '🔞 Conteúdo NSFW',
            value: codeBlock('txt', data.nsfwLevel),
            inline: true
        },
        {
            name: `${e.Partner} Parceiro do Discord`,
            value: codeBlock('txt', data.partnered),
            inline: true
        },
        {
            name: '🗺️ Linguagem',
            value: codeBlock('txt', data.preferredLocale),
            inline: true
        },
        {
            name: '📈 Barra de Booster',
            value: codeBlock('txt', data.premiumProgressBarEnabled),
            inline: true
        },
        {
            name: '📨 Convite Personalizado',
            value: codeBlock('txt', data.vanityURLCode),
            inline: true
        },
        {
            name: '👮 Nível de Segurança',
            value: codeBlock('txt', data.verificationLevel),
            inline: true
        },
        {
            name: '✅ Verificado',
            value: codeBlock('txt', data.verified),
            inline: true
        },
    ]

    const embed = {
        color: client.blue,
        title: '🔎 Informações do Servidor | SUPLEMENTAR',
        description: `${e.Commands} Dados suplementares, interessentes e talvez, importantes.`,
        fields,
        footer: {
            text: `Server ID: ${guild.id} `,
            iconURL: guild.iconURL() || null
        }
    }

    function formatChannel(channel, channelId) {
        return channel
            ? `${sameGuild ? `${channel}\n\`${channel}\`` : codeBlock('txt', `${channel.name}\n${channelId}`)}`
            : codeBlock('txt', 'Nenhum Canal\n-----------')
    }

    return interaction.message.edit({ embeds: [embed], components: [selectMenu] }).catch(() => { })
}