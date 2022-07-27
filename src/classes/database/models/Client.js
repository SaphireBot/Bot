import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Client", new Schema({
    id: { type: String, unique: true },
    Timeouts: { RestoreDividas: Number },
    ComandosUsados: Number,
    CommandsCount: Object,
    Cache: Object,
    Moderadores: Array,
    Administradores: Array,
    TopGlobal: Object,
    ComandosBloqueados: Array,
    ComandosBloqueadosSlash: Array,
    VipCodes: Array,
    BackgroundAcess: Array,
    BlockedUsers: Array,
    PremiumServers: Array,
    FlagGame: {
        TopOne: String
    },
    Raspadinhas: {
        Bought: Number,
        totalPrize: Number
    },
    Zeppelin: {
        winTotalMoney: Number,
        loseTotalMoney: Number,
        Explode: Number,
        distanceData: {
            value: Number,
            winner: String
        }
    },
    Rebooting: {
        ON: Boolean,
        Features: String,
        ChannelId: String,
        MessageId: String
    },
    Titles: {
        BugHunter: Array,
        OfficialDesigner: Array,
        Halloween: Array,
        Developer: Array
    },
    Blacklist: {
        Users: Array,
        Guilds: Array,
        Economy: Array
    },
    Porquinho: {
        LastPrize: Number,
        LastWinner: String,
        Money: Number
    },
    GlobalBet: {
        '0': Array,
        '100': Array,
        '2000': Array,
        '5000': Array,
        '10000': Array,
        '20000': Array,
        '30000': Array,
        '40000': Array,
        '50000': Array,
        '60000': Array,
        '70000': Array,
        '80000': Array,
        '90000': Array,
        '100000': Array
    },
}))