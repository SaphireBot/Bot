import { SaphireClient as client, Discloud } from '../../../../../../classes/index.js'
import { Emojis as e } from '../../../../../../util/util.js'

export default async interaction => {

    await interaction.reply({
        content: `${e.Loading} | Solicitando informações a Discloud Host...`
    })

    const response = await Discloud.apps.fetch()

    if (!response)
        return await interaction.editReply({
            content: `${e.Deny} | Nenhuma informação foi coletada.`
        }).catch(() => { })

    const apps = [...response.values()]
    const embeds = []

    for (let app of apps)
        embeds.push({
            color: client.blue,
            title: '🤖 Informações das Aplicações | Discloud',
            fields: [
                {
                    name: '🧩 Informações Basicas',
                    value: `Auto Restart: ${app.autoRestart ? e.Check : e.Deny}\nid: \`${app.id}\`\nLinguagem: \`${app.lang}\`\nArquivo Principal: \`${app.mainFile}\``
                },
                {
                    name: `🛡 Moderadores - ${app.mods.length}`,
                    value: app.mods.length > 0 ? app.mods.map(id => `${client.users.resolve(id)?.tag} - \`${id}\`` || `*Not Found* - \`${id}\``).join('\n') : 'Nenhum moderador'
                },
                {
                    name: '📡 Status',
                    value: `${app.online ? `🟢 Online com ${e.Ram} ${app.ram}MB RAM disponível` : '🔴 Offline'}`
                }
            ]
        })

    return await interaction.editReply({
        content: null,
        embeds: embeds
    })

}