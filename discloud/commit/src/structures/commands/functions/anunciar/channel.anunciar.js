import { SaphireClient as client } from "../../../../classes/index.js"
import { DiscordPermissons } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async ({ interaction, guildData, toEdit = false, response = null }) => {

    const member = interaction?.member || await interaction.guild.members.fetch(interaction.user.id).catch(() => null)
    const guild = interaction?.guild

    if (!member)
        return toEdit
            ? await interaction.update({ content: `${e.Deny} | Membro não encontrado.`, embeds: [], components: [] }).catch(() => { })
            : await interaction.reply({ content: `${e.Deny} | Membro não encontrado.`, embeds: [], components: [] })

    if (!member.permissions.has(DiscordPermissons.Administrator))
        return toEdit
            ? await interaction.update({ content: `${e.Deny} | Apenas administradores podem configurar o canal e os cargos deste sistema.`, embeds: [], components: [] }).catch(() => { })
            : await interaction.reply({ content: `${e.Deny} | Apenas administradores podem configurar o canal e os cargos deste sistema.`, embeds: [], components: [] })

    const channel = await guild.channels.fetch(guildData?.announce?.channel || "undefined").catch(() => null)
    const notificationRole = await guild.roles.fetch(guildData?.announce?.notificationRole || "undefined").catch(() => null)
    const allowedRole = await guild.roles.fetch(guildData?.announce?.allowedRole || "undefined").catch(() => null)

    const responseData = {
        content: response,
        embeds: [{
            color: client.blue,
            title: "💬 Painel de Configuração do Sistema De Anúncio",
            fields: [
                {
                    name: "📰 Canal de Envio",
                    value: `${channel || "`Sem canal definido`"}\n*~ O canal onde as notícias serão enviadas.*\n*~ Apenas canais de textos são válidos.*`
                },
                {
                    name: `${e.Notification} Cargo de Notificação`,
                    value: `${notificationRole || "`Sem cargo definido`"}\n*~ Cargo a ser notificado a cada notícia enviada.*\n*~ Cargos já configurados ou cargos com permissões administrativas são inválidos.*`
                },
                {
                    name: "✍ Cargo dos Repórteres",
                    value: `${allowedRole || "`Sem cargo definido`"}\n*~ Usuários com este cargo podem lançar novas notícias.*\n*~ Cargos já configurados ou cargos com permissões administrativas são inválidos.*`
                }
            ]
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 3,
                        placeholder: "Outras opções",
                        custom_id: JSON.stringify({ c: "anunciar", src: "options" }),
                        options: [
                            {
                                label: 'Resetar sistema',
                                description: "Resete este comando do servidor",
                                emoji: e.Trash,
                                value: 'reset'
                            },
                            {
                                label: 'Deletar mensagem',
                                description: 'Delete esta mensagem',
                                emoji: e.Trash,
                                value: 'deleteMessage'
                            },
                            {
                                label: 'Atualizar embed',
                                description: 'Atualize a embed em caso de algum erro',
                                emoji: '🔄',
                                value: 'refresh'
                            },
                            {
                                label: 'Nova notícia',
                                description: 'Publique uma nova notícia',
                                emoji: '✍',
                                value: 'notice'
                            }
                        ]
                    }
                ]
            }
        ]
    }

    return toEdit
        ? await interaction.update(responseData).catch(() => { })
        : await interaction.reply(responseData)

}