import { SaphireClient as client, Database, Modals } from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'
import { Permissions } from '../../../../../util/Constants.js'

export default async interaction => {

    const { options, channel, member } = interaction
    const subCommand = options.getSubcommand()

    if (subCommand === 'options') return adicitionalOptions()
    return import(`../../../functions/logomarca/${subCommand}.logomarca.js`).then(execute => execute.default(interaction))

    async function adicitionalOptions() {

        const func = options.getString('option')
        if (func === 'liberate') return liberate()
        if (func === 'bug') return await interaction.showModal(Modals.logomarcaBug)
        if (func === 'suggest') return await interaction.showModal(Modals.indicateLogomarca)

        if (func === 'info')
            return await interaction.reply({
                embeds: [
                    {
                        color: client.blue,
                        title: `${e.logomarca} ${client.user.username}'s Logo & Marca Info`,
                        description: `O jogo Logo & Marca é um Quiz. O objetivo é simples, acertar o máximo de logos e marcas que aparecer.`,
                        fields: [
                            {
                                name: '🔄 Reset',
                                value: 'Quando ninguém acertar a marca, você pode recomeçar um novo jogo sem ter que usar o comando novamente. E claro, o reset é para começar tudo novamente.'
                            },
                            {
                                name: '😨 HO MEU DEUS, EU NÃO APAREÇO NO RANKING',
                                value: 'Calma aí coisinha fofa! Apenas os 7 primeiros com mais pontos aparecem no ranking, mas o pontos serão contados e irão pro ranking assim que o jogo terminar.'
                            },
                            {
                                name: `${e.bug} Bugou, e agora?`,
                                value: `Reporte o problema atráves do comando </logomarcas options:${interaction.commandId}> e use a opção \`Reportar um erro/bug\``
                            },
                            {
                                name: `${e.saphireOlhadinha} Intelligence`,
                                value: 'Já pensou você com mais de 100 pontos e meu criador me reinicia ou por algum motivo no universo o comando buga? Então, com o Intelligence, você não irá perder seus pontos. É só começar outro jogo e ao final dele, todos os pontos de todos os seus jogos serão adicionados ao seu perfil. Legal, né?'
                            },
                            {
                                name: `${e.logomarca} Créditos`,
                                value: `${e.Gear} Código Fonte: ${client.users.resolve(Database.Names.Rody)?.tag || 'Rody#1000'}\n🖌 Designer e Edição: ${client.users.resolve(Database.Names.San)?.tag || 'San O.#0001'}\n${e.boxes} Recursos: ${client.users.resolve(Database.Names.Khetlyn)?.tag || 'Khetlyn#4323'} & ${client.users.resolve(Database.Names.Moana)?.tag || 'moana#6370'}`
                            }
                        ],
                        footer: { text: `${Database.Logomarca.length || 0} Logos & Marcas` }
                    }
                ]
            })
    }

    async function liberate() {

        const inChannelsGame = await Database.Cache.Logomarca.get(`${client.shardId}.Channels`)

        if (!inChannelsGame || !inChannelsGame.length || !inChannelsGame?.includes(channel.id))
            return await interaction.reply({
                content: `${e.Deny} | Esse canal não está cadastrado no canais em jogo.`,
                ephemeral: true
            })

        if (!member.memberPermissions(Permissions.Administrator))
            return await interaction.reply({
                content: `${e.Deny} | Apenas um administrador do servidor pode liberar outro jogo neste canal.`,
                ephemeral: true
            })

        await Database.Cache.Logomarca.pull(`${client.shardId}.Channels`, channel.id)

        return await interaction.reply({
            content: `${e.Check} | Esse canal foi retirado dos canais registrados e pode começar um novo jogo.`
        })

    }
}