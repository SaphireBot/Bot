import ModelClan from './models/Clans.js'
import ModelClient from './models/Client.js'
import ModelGiveaway from './models/Giveaway.js'
import ModelGuild from './models/Guild.js'
import ModelLotery from './models/Lotery.js'
import ModelRaffle from './models/Raffle.js'
import ModelReminders from './models/Reminders.js'
import ModelUser from './models/User.js'

/**
 * Unificação de todos os Models para extensão da Classe Database
 */

class Models {
    constructor() {
        this.Clan = ModelClan
        this.Client = ModelClient
        this.Giveaway = ModelGiveaway
        this.Guild = ModelGuild
        this.Lotery = ModelLotery
        this.Raffle = ModelRaffle
        this.Reminder = ModelReminders
        this.User = ModelUser
    }
}

export {
    ModelClan as Clan,
    ModelClient as Client,
    ModelGiveaway as Giveaway,
    ModelGuild as Guild,
    ModelLotery as Lotery,
    ModelRaffle as Raffle,
    ModelReminders as Reminders,
    ModelUser as User,
    Models
}