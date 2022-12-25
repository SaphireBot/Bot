import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("User", new Schema({
    id: { type: String, unique: true },
    Likes: Number,
    Xp: Number,
    Level: Number,
    Transactions: Array,
    Balance: Number,
    AfkSystem: String,
    DailyCount: Number,
    MixCount: Number,
    QuizCount: Number,
    TicTacToeCount: Number,
    CompetitiveMemoryCount: Number,
    ForcaCount: Number,
    Letters: {
        Blocked: Boolean,
        Sended: Array,
        Recieved: Array
    },
    GamingCount: {
        FlagCount: Number,
        AnimeThemeCount: Number,
        Logomarca: Number
    },
    Timeouts: {
        Bug: Number,
        Daily: Number,
        Cu: Number,
        Esmola: Number,
        Work: Number,
        ImagesCooldown: Number,
        ServerIdeia: Number,
        Letter: Number,
        Confess: Number,
        Loteria: Number,
        Cantada: Number,
        Bitcoin: Number,
        Porquinho: Number,
        TopGGVote: Number,
        Rep: Number,
    },
    Cache: { ComprovanteOpen: Boolean },
    Color: {
        Perm: Boolean,
        Set: String
    },
    Perfil: {
        Titulo: String,
        Status: String,
        Sexo: String,
        Signo: String,
        Aniversario: String,
        Trabalho: String,
        BalanceOcult: Boolean,
        Family: Array,
        Parcas: Array,
        Marry: {
            Conjugate: String,
            StartAt: Number
        },
        Bits: Number,
        Bitcoins: Number,
        Estrela: {
            Um: Boolean,
            Dois: Boolean,
            Tres: Boolean,
            Quatro: Boolean,
            Cinco: Boolean,
            Seis: Boolean,
        }
    },
    Vip: {
        DateNow: Number,
        TimeRemaing: Number,
        Permanent: Boolean
    },
    Slot: {
        Cartas: Number,
        Dogname: String,
        Skip: Number
    },
    Walls: {
        Bg: Array,
        Set: String
    },
    PrivateChannel: {
        Channel: String,
        Users: Array
    },
    Jokempo: {
        Wins: Number,
        Loses: Number
    }
}))