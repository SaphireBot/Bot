import { Emojis as e } from "../../../../util/util.js";

// Obrigado Clyde ❤️
export default (board) => {

    // Verifica horizontalmente
    for (let row = 0; row < board.length; row++)
        for (let col = 0; col <= board[row].length - 4; col++)
            if (
                board[row][col] !== null &&
                board[row][col] === board[row][col + 1] &&
                board[row][col] === board[row][col + 2] &&
                board[row][col] === board[row][col + 3]
            )
                if (board[row][col] !== e.white)
                    return board[row][col]; // O jogador vencedor é retornado


    // Verifica verticalmente
    for (let row = 0; row <= board.length - 4; row++)
        for (let col = 0; col < board[row].length; col++)
            if (
                board[row][col] !== null &&
                board[row][col] === board[row + 1][col] &&
                board[row][col] === board[row + 2][col] &&
                board[row][col] === board[row + 3][col]
            )
                if (board[row][col] !== e.white)
                    return board[row][col]; // O jogador vencedor é retornado


    // Verifica diagonalmente (ascendente)
    for (let row = 3; row < board.length; row++)
        for (let col = 0; col <= board[row].length - 4; col++)
            if (
                board[row][col] !== null &&
                board[row][col] === board[row - 1][col + 1] &&
                board[row][col] === board[row - 2][col + 2] &&
                board[row][col] === board[row - 3][col + 3]
            )
                if (board[row][col] !== e.white)
                    return board[row][col]; // O jogador vencedor é retornado


    // Verifica diagonalmente (descendente)
    for (let row = 0; row <= board.length - 4; row++)
        for (let col = 0; col <= board[row].length - 4; col++)
            if (
                board[row][col] !== null &&
                board[row][col] === board[row + 1][col + 1] &&
                board[row][col] === board[row + 2][col + 2] &&
                board[row][col] === board[row + 3][col + 3]
            )
                if (board[row][col] !== e.white)
                    return board[row][col]; // O jogador vencedor é retornado


    return null

}