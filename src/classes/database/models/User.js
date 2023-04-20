import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("User", new Schema({
    id: { type: String, unique: true },
    Likes: Number,
    // {
    //     access_token: String,
    //     refresh_token: tokens.refresh_token,
    //     expires_at: Date.now() + tokens.expires_in * 1000,
    // }
    Tokens: Object,
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
    GamingCount: {
        FlagCount: Number,
        AnimeThemeCount: Number,
        QuizAnime: Number,
        Logomarca: Number,
        QuizQuestions: Number
    },
    Timeouts: {
        Bug: Number,
        Daily: Number,
        ImagesCooldown: Number,
        Loteria: Number,
        Cantada: Number,
        Bitcoin: Number,
        Porquinho: Number,
        TopGGVote: Number,
        Rep: Number
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
    Walls: {
        Bg: Array,
        Set: String
    },
    Jokempo: {
        Wins: Number,
        Loses: Number
    }
}))