import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('guildMemberAdd', async member => {

    if (!member.guild.available || member.user.bot) return

    const guild = await Database.Guild.findOne({ id: member.guild.id }, 'Autorole WelcomeChannel Antifake LogChannel')
    if (!guild) return Database.registerServer(member.guild)

    const CanalDB = guild?.WelcomeChannel?.Canal
    const Mensagem = guild?.WelcomeChannel?.Mensagem || `$member entrou no servidor.`
    const Canal = member?.guild.channels.cache.get(guild?.WelcomeChannel?.Canal)

    Welcome()

    async function Welcome() {

        if (!Canal && CanalDB) return DelWelcomeSystem()

        if (!Canal) return

        const newMessage = Mensagem.replace('$member', member).replace('$servername', member.guild.name)

        return Canal.send(`${newMessage}`)
            .catch(async err => {
                DelWelcomeSystem()
                const owner = await client.users.fetch(config.ownerId).catch(() => null)
                if (!owner) return
                return owner.send(`${e.Warn} | Erro no evento "guildMemberAdd"\n\`${err}\``)
            })
    }

    async function DelWelcomeSystem() {
        await Database.Guild.updateOne(
            { id: member.guild.id },
            { $unset: { WelcomeChannel: 1 } }
        )
        return Notify(member.guild.id, 'Recurso desabilitado - Boas-Vindas', `O canal presente no meu banco de dados é compátivel com nenhum dos canais deste servidor. Reconfigure utilizando o comando \`/config\``)
    }

    function Notify() { }

})