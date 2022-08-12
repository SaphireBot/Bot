import {
    SaphireClient as client
} from '../../classes/index.js'

client.on('guildMemberAdd', async Member => {

    if (!client.allUsers.find(user => user.id === Member.user.id))
        client.allUsers.push(Member.user)

})