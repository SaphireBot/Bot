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
        title: `${e.noSignal} AFK System`,
        description: 'Comando para avisar que um usuário está AFK',
        fields: [
            {
                name: `${e.QuestionMark} Como funciona?`,
                value: 'O AFK é um comando que ativa um sistema de notificação que avisará todos os usuários que te marcarem ou mencionar uma mensagem que você mandou. Você também pode gravar uma mensagem para ser mostrada.'
            },
            {
                name: '1️⃣ Opções Primárias',
                value: '`ativar` - Ative o comando\n`desativar` - Desative o comando'
            },
            {
                name: '🌐 AFK Global',
                value: 'O sistema GSN `Global System Notification` permite que você possa ativar o `/afk` em todos os servidores onde a Saphire estiver.\nSe você quiser, pode ativar somente em um servidor.'
            },
            {
                name: '🚩 /afk ativar onde',
                value: 'O `onde` é um valor obrigatório neste comando'
            },
            {
                name: '✍️ /afk ativar onde: ... message: ...',
                value: 'Você pode deixar uma mensagem gravada para a Saphire avisar quando te mencionarem'
            },
            {
                name: '📝 Gerenciar Nicknames',
                value: 'Se a Saphire tiver a permissão para alterar apelidos, ela pode adicionar vai adicionar a tag `[AFK]` no seu nickname ao ativar o `/afk`. Não funciona com o dono do servidor.'
            },
            {
                name: '📨 Desativação automática',
                value: 'Assim que você mandar mensagem em qualquer lugar onde esteja a Saphire ou usar o comando `/afk desativar` o sistema de notificações será desativado até você reativa-lo novamente.'
            }
        ]
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