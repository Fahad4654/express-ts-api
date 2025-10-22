import { where } from "sequelize";
import { GameHistory } from "../models/GameHistory";

export async function userGameSummary(userId: String){
    const winAmount = GameHistory.count({where: {type: "win"}})
    const loseAmount = GameHistory.count({where: {type: "lose"}})

}