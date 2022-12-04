import { ApplicationCommandOptionType } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'

export default {
    name: 'afk',
    description: '[util] Comando simples de AFK',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'ativar',
            description: '[util] Ative o sistema AFK e deixe um lembrete para quem te marcar',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'onde',
                    description: 'Onde você quer ativar o AFK?',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'Neste servidor',
                            value: 'server'
                        },
                        {
                            name: 'Em todos os servidores',
                            value: 'global'
                        }
                    ]
                },
                {
                    name: 'message',
                    description: 'Mensagem de aviso quando um usuário te marcar.',
                    type: ApplicationCommandOptionType.String
                }
            ]
        },
        {
            name: 'desativar',
            description: '[util] Desative o sistema AFK',
            type: ApplicationCommandOptionType.Subcommand,
            options: []
        }
    ],
    helpData: {
        description: 'Comando para avisar que um usuário está AFK'
    },
    async execute({ interaction, Database }) {

        const { options, user, guild, member } = interaction
        const subCommand = options.getSubcommand()

        if (!subCommand)
            return await interaction.reply({
                content: `${e.Deny} | Sub-comando não encontrado.`,
                ephemeral: true
            })

        return subCommand === "ativar"
            ? activeAfkCommand()
            : desableAfkCommand()

        async function activeAfkCommand() {
            const message = options.getString('message') || 'No Message'
            const where = options.getString('onde') === "server"

            await Database.Cache.AfkSystem.set(`${where ? guild.id : 'Global'}.${user.id}`, message)

            member.setNickname(`${member.displayName} [AFK]`, 'AFK Command Enable').catch(() => { })

            return await interaction.reply({
                content: `${e.Check} | Você ativou o AFK. Eu vou avisar todos que marcarem você.${message !== 'No Message' ? `\n📝 | ${message}` : ''}`,
                ephemeral: true
            })
        }

        async function desableAfkCommand() {

            Database.Cache.AfkSystem.delete(`${guild.id}.${user.id}`)
            Database.Cache.AfkSystem.delete(`Global.${user.id}`)
            member.setNickname(member.displayName.replace('[AFK]', ''), 'AFK Command Disable').catch(() => { })

            return await interaction.reply({
                content: `${e.Check} | Sistema AFK desativado.`,
                ephemeral: true
            })
        }

    }
}