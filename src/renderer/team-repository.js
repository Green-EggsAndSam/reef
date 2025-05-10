/**
 * Saves and retrieves team data from the database.
 * 
 * Notes: 
 *  - We should support disqualifications and surrogates, but an option is to do it by manually editing the
 *      database.
 */

import { Team } from "./team.js"

// Put manual db generation here
function generate() {
    generateTeam(5, "Red 1");
    generateTeam(12, "Red 2");  
    generateTeam(7, "Red 3");
    generateTeam(3, "Red 4");
    generateTeam(10, "Red 5");  
    generateTeam(15, "Red 6");
}

$(generate);

export function generateTeam(number, name) {
    if (Object.keys(window.teamDb.findOne({ Number: number })) == 0) {
        window.teamDb.save({ Number: number, Name: name });
    }
}

/**
 * @return {Team[]}
 */
export function getAllTeams() {
    let teams = window.teamDb.findAll();
    teams.forEach((e, i, a) => a[i] = new Team(e.Number));
    return teams;
}

export function getTeamName(number) {
    return window.teamDb.findOne({ Number: number }).Name;
}