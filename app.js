'use strict'

import fetch from 'node-fetch'

const accessToken = process.env.ACCESS_TKN
let balance = 0, nBets = 0, multiplier = 2, win = true, startTime = new Date(), speed = 0, startBalance = 0, profit = 0, profitPerHour = 0, profitPercentage = 0, maxMultiplier = 0, maxBalance = 0.00000001, betAmount = 0.00000001

async function sendBet() {
    await fetch('https://wolf.bet/api/v1/bet/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + accessToken},
        body: JSON.stringify({
            currency: "doge",
            game: "dice",
            amount: betAmount,
            rule: "under",
            multiplier: Math.ceil(((100 - 1) / (Math.floor((10000 - 100) / multiplier) / 100)) * 10000) / 10000,
            bet_value: Math.floor((10000 - 100) / multiplier) / 100
        })
    })
        .then(response => response.json())
        .then(data => {
            balance = data.userBalance.amount
            win = (data.bet.state == 'win') ? true : false
            nBets++
        })
}

await sendBet()
startBalance = balance
betAmount = Math.max((balance / 1000000).toFixed(8), 0.00000001)

async function run() {
    if (win) {
        multiplier = 2
        if (balance > maxBalance) {
            maxBalance = balance
            betAmount = Math.max((maxBalance / 1000000).toFixed(8), 0.00000001)
        }
    } else if (!win) {
        multiplier++
        if (multiplier > maxMultiplier) maxMultiplier = multiplier
        if (multiplier > 9900) multiplier = 2
    }
    await sendBet()
    profit = (balance - startBalance).toFixed(8)
    let now = new Date()
    speed = (nBets / ((now - startTime) / 1000)).toFixed(2)
    profitPerHour = (profit / ((now - startTime) / 1000) * 3600).toFixed(8)
    console.log('BET:', Math.max(maxBalance / 1000000, 0.00000001).toFixed(8), 'RESULT:', (win) ? ' WIN' : 'LOSE', 'MULT.:', multiplier,'MAX MULT.:', String(maxMultiplier).padStart(4, 0), 'BALANCE:', String(balance).slice(0, -2).padStart(10), 'PROFIT:', profit.padStart(11), 'SPEED:', speed, 'PROFIT/HOUR:', profitPerHour.padStart(11))
    await run()
}

await run()