/**
 * @param { { 'userId1': '👊' | '🤚' | '✌️', 'userId2': '👊' | '🤚' | '✌️' } } clicksData
 */
export default (clicksData) => {

    const clicks = Object.entries(clicksData) // [["string", "emoji" | null], ["string", "emoji" | null]]
    if (clicks[0][1] == clicks[1][1]) return 'draw'

    const variables = [
        ['👊', '✌️'],
        ['🤚', '👊'],
        ['✌️', '🤚']
    ]

    for (const conditional of variables)
        if (
            conditional[0] == clicks[0][1]
            && conditional[1] == clicks[1][1]
        ) return clicks[0]

    return clicks[1]
}