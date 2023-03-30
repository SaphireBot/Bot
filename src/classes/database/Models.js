import Fanart from './models/Fanart.js'
import ModelClient from './models/Client.js'
import ModelGuild from './models/Guild.js'
import ModelEconomy from './models/Economy.js'
import ModelReminders from './models/Reminders.js'
import ModelUser from './models/User.js'
import Rather from './models/Rather.js'
import Indications from './models/Indications.js'
import Cantadas from './models/Cantadas.js'
import Memes from './models/Memes.js'
import Anime from './models/Anime.js'
import Quiz from './models/Quiz.js'
import Jokempo from './models/Jokempo.js'

/**
 * Unificação de todos os Models para extensão da Classe Database
 */

class Models {
    constructor() {
        this.Fanart = Fanart
        this.Client = ModelClient
        this.Guild = ModelGuild
        this.Economy = ModelEconomy
        this.Reminder = ModelReminders
        this.User = ModelUser
        this.Rather = Rather
        this.Indications = Indications
        this.Cantadas = Cantadas
        this.Memes = Memes
        this.Anime = Anime
        this.Quiz = Quiz
        this.Jokempo = Jokempo
    }
}

export {
    Fanart,
    ModelClient as Client,
    ModelGuild as Guild,
    ModelEconomy as Economy,
    ModelReminders as Reminders,
    ModelUser as User,
    Models,
    Rather,
    Indications,
    Cantadas,
    Memes,
    Anime,
    Quiz,
    Jokempo
}