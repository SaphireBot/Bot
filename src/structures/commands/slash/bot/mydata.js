import { ApplicationCommandOptionType, AttachmentBuilder, ButtonStyle } from 'discord.js'
import { DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js'
import { SaphireClient as client, Database } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'

export default {
    name: 'mydata',
    name_localizations: { 'pt-BR': 'meus_dados' },
    description: '[bot] Visualize seus dados presentes no banco de dados',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'required',
            name_localizations: { 'pt-BR': 'requerido' },
            description: 'Método obrigatório',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Deletar Dados',
                    value: 'delete'
                },
                {
                    name: 'Visualizar Dados',
                    value: 'view'
                }
            ],
            required: true
        },
        {
            name: 'user',
            name_localizations: { 'pt-BR': 'usuário' },
            description: '[STAFF\'s SAPHIRE ONLY] Visualizar dados de outros usuários',
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'options',
            name_localizations: { 'pt-BR': 'opções' },
            description: 'Mais opções do comando',
            type: ApplicationCommandOptionType.String,
            choices: [{
                name: 'Esconder meus dados em uma mensagem só pra mim',
                value: 'ephemeral'
            }]
        }
    ],
    helpData: {
        description: 'Recurso para visualizar os dados no banco de dados',
        permissions: [DiscordPermissons.AttachFiles],
    },
    apiData: {
        name: "mydata",
        description: "Veja os seus dados presentes no banco de dados",
        category: "Saphire",
        synonyms: ["meus_dados"],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, guild }, commandData) {

        if (commandData) return deleteData()
        const ephemeral = interaction.options.getString('options') == 'ephemeral'

        if (!guild.members.me.permissions.has(DiscordPermissons.AttachFiles, true))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.AttachFiles}\`** para executar este recurso.`,
                ephemeral
            })

        const user = interaction.options.getUser('user') || interaction.user

        if (user.bot)
            return await interaction.reply({
                content: `${e.DenyX} | Bots não possuem nenhuma informação no meu banco de dados.`,
                ephemeral
            })

        if (user.id !== interaction.user.id && !client.admins.includes(interaction.user.id))
            return await interaction.reply({
                content: `${e.DenyX} | Apenas os meus administradores podem acessar dados de outros usuários.`,
                ephemeral
            })

        const data = await Database.getUser(user.id)

        if (!data)
            return await interaction.reply({ content: `${e.DenyX} Nenhum dado foi encontrado.`, ephemeral })

        await interaction.reply({ content: `${e.Loading} | Carregando seus dados no banco de dados`, ephemeral })

        const dataObjectFormat = JSON.stringify({
            id: data.id,
            Likes: data.Likes || 0,
            Xp: data.Xp || 0,
            Level: data.Level,
            Transactions: `${data.Transactions?.length || 0} Registros - Confira em /transactions`,
            Balance: `${data.Balance || 0} Safiras`,
            AfkSystem: data.AfkSystem || 'Recurso Desativado',
            DailyCount: data.DailyCount || 0,
            MixCount: data.MixCount || 0,
            QuizCount: data.QuizCount || 0,
            TicTacToeCount: data.TicTacToeCount || 0,
            CompetitiveMemoryCount: data.CompetitiveMemoryCount || 0,
            ForcaCount: data.ForcaCount || 0,
            GamingCount: {
                FlagCount: data.GamingCount?.FlagCount || 0,
                AnimeThemeCount: data.GamingCount?.AnimeThemeCount || 0,
                QuizAnime: data.GamingCount?.QuizAnime || 0,
                Logomarca: data.GamingCount?.Logomarca || 0,
                QuizQuestions: data.GamingCount?.QuizQuestions || 0,
            },
            Timeouts: {
                Bug: (data.Timeouts?.Bug || 0) - Date.now() < 0 ? 'Desativado' : 'Ativado',
                Daily: (data.Timeouts?.Daily || 0) - Date.now() < 0 ? 'Desativado' : 'Ativado',
                ImagesCooldown: (data.Timeouts?.ImagesCooldown || 0) - Date.now() < 0 ? 'Desativado' : 'Ativado',
                Loteria: (data.Timeouts?.Loteria || 0) - Date.now() < 0 ? 'Desativado' : 'Ativado',
                Cantada: (data.Timeouts?.Cantada || 0) - Date.now() < 0 ? 'Desativado' : 'Ativado',
                Bitcoin: (data.Timeouts?.Bitcoin || 0) - Date.now() < 0 ? 'Desativado' : 'Ativado',
                Porquinho: (data.Timeouts?.Porquinho || 0) - Date.now() < 0 ? 'Desativado' : 'Ativado',
                TopGGVote: (data.Timeouts?.TopGGVote || 0) - Date.now() < 0 ? 'Desativado' : 'Ativado',
                Rep: (data.Timeouts?.Rep || 0) - Date.now() < 0 ? 'Desativado' : 'Ativado',
            },
            // Cache: { ComprovanteOpen: Boolean },
            Color: {
                Perm: data.Color?.Perm ? 'Ativado' : 'Desativo',
                Set: data.Color?.Set ? data.Color?.Set : 'Nenhuma cor selecionada'
            },
            Perfil: {
                Titulo: data.Perfil?.Titulo ? data.Perfil?.Titulo : 'Não Definido',
                Status: data.Perfil?.Status ? data.Perfil?.Status : 'Não Definido',
                Sexo: data.Perfil?.Sexo ? data.Perfil?.Sexo : 'Não Definido',
                Signo: data.Perfil?.Signo ? data.Perfil?.Signo : 'Não Definido',
                Aniversario: data.Perfil?.Aniversario ? data.Perfil?.Aniversario : 'Não Definido',
                Trabalho: data.Perfil?.Trabalho ? data.Perfil?.Trabalho : 'Não Definido',
                BalanceOcult: data.Perfil?.BalanceOcult ? 'Sim' : 'Não',
                Marry: {
                    Conjugate: data.Perfil?.Marry?.Conjugate ? data.Perfil?.Marry?.Conjugate : 'Ninguém',
                    StartAt: data.Perfil?.StartAt ? Date.format(data.Perfil?.StartAt?.valueOf(), false, false) : '0'
                },
                Bits: data.Perfil?.Bits || 0,
                Bitcoins: data.Perfil?.Bitcoins || 0,
                Estrela: {
                    Um: data.Perfil?.Estrela?.Um ? 'Ativo' : 'Desativado',
                    Dois: data.Perfil?.Estrela?.Dois ? 'Ativo' : 'Desativado',
                    Tres: data.Perfil?.Estrela?.Tres ? 'Ativo' : 'Desativado',
                    Quatro: data.Perfil?.Estrela?.Quatro ? 'Ativo' : 'Desativado',
                    Cinco: data.Perfil?.Estrela?.Cinco ? 'Ativo' : 'Desativado',
                    Seis: data.Perfil?.Estrela?.Seis ? 'Ativo' : 'Desativado',
                }
            },
            Vip: {
                DateNow: data.Vip?.DateNow ? `Acaba em ${Date.format(data?.Vip?.DateNow, false, false)}` : 0,
                TimeRemaing: data.Vip?.TimeRemaing ? `Tempo restante: ${Date.stringDate(data?.Vip?.DateNow - data?.Vip?.TimeRemaing)}` : 0,
                Permanent: data?.Vip?.Permanent ? 'Sim' : 'Não'
            },
            Walls: {
                Bg: `${data.Walls?.Bg?.length || 0} Backgrounds - Confira em /level`,
                Set: data.Walls?.Set ? data.Walls?.Set : 'Nenhum'
            },
            Jokempo: {
                Wins: data.Jokempo?.Wins ? data.Jokempo?.Wins : 0,
                Loses: data.Jokempo?.Loses ? data.Jokempo?.Loses : 0,
            }
        }, null, 2)

        const rawData = JSON.stringify(data, null, 2)

        const file = Buffer.from(
            `---------- DATABASE INFO SYSTEM ----------
Database: MongoDB - https://www.mongodb.com/
User: ${user.username} - ${user.id}
Asked by: ${interaction.user.username} - ${interaction.user.id}
Build in: ${Date.format(Date.now(), false, false)}
Protected by: https://saphire.gitbook.io/saphire/saphire/termos-de-servicos

--- MONGODB DOCUMENT OBJECT FORMATTED DATA ---

${dataObjectFormat}


--- MONGODB DOCUMENT OBJECT ORIGINAL DATA ---

${rawData}
`)

        return interaction.editReply({
            content: interaction.options.getString('required') == 'view'
            ? null
            : `${e.Info} | Ao deletar seus dados, a **Saphire Team não se responsabiliza por quaisquer perca de dados**. É de total **responsabilidade sua**, o que você faz com seus dados.`,
            files: [new AttachmentBuilder(file, { name: 'saphire-database-viewer-data.txt', description: 'Object from users database' })],
            components: interaction.options.getString('required') == 'view' ? [] : [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: interaction.user.id == user.id ? 'Deletar Meus Dados' : 'Deletar Dados do Usuário',
                            emoji: e.Trash,
                            custom_id: JSON.stringify({ c: 'mydata', userId: user.id }),
                            style: ButtonStyle.Danger
                        }
                    ]
                }
            ]
        }).catch(() => { })

        async function deleteData() {

            if (commandData.userId !== interaction.user.id && !client.admins.includes(interaction.user.id))
                return interaction.reply({
                    content: `${e.DenyX} | Apenas os autor do documento e meus administradores podem apagar os dados do banco de dados.`,
                    ephemeral: true
                })

            return Database.deleteUser(commandData.userId)
                .then(async value => {

                    if (value.deletedCount == 1)
                        return interaction.update({
                            content: `${e.CheckV} | ${commandData.userId == interaction.user.id
                                ? 'Os seus dados foram deletados com sucesso.'
                                : `Os dados de **${(await client.users.fetch(commandData.userId).then(user => user.username).catch(() => 'Not Found'))} - \`${commandData.userId}\`** foram deletados com sucesso.`
                                }`,
                            files: [],
                            components: []
                        }).catch(() => { })

                    return interaction.update({
                        content: `${e.DenyX} | Nenhum dado foi deletado.`,
                        files: [], components: []
                    }).catch(() => { })
                })
                .catch(err => {
                    return interaction.update({
                        content: `${e.DenyX} | Não foi possível deletar esse documento.\n${e.bug} | \`${err}\``,
                        files: [], components: []
                    }).catch(() => { })
                })

        }
    }
}