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
    generateTeam(1, "Red 1");
    generateTeam(2, "Red 2");  
    generateTeam(3, "Red 3");
    generateTeam(4, "Red 4");
    generateTeam(5, "Red 5");  
    generateTeam(6, "Red 6");
    generateTeam(7, "Red 7");
    generateTeam(99, "Red 99");
    generateTeam(9, "Red 9");
    generateTeam(10, "Red 10");
    generateTeam(11, "Red 11");
    generateTeam(12, "Red 12");
    generateTeam(13, "Red 13");
    generateTeam(14, "Red 14");
    generateTeam(15, "Red 15");
    generateTeam(16, "Red 16");
    generateTeam(17, "Red 17");
    generateTeam(18, "Red 18");
    generateTeam(19, "Red 19");
    generateTeam(20, "Red 20");
    generateTeam(21, "Red 21");
    generateTeam(22, "Red 22");
    generateTeam(67, "Red 67");
    generateTeam(24, "Red 24");
    generateTeam(25, "Red 25");
    generateTeam(26, "Red 26");
    generateTeam(27, "Red 27");
    generateTeam(28, "Red 28");
    generateTeam(29, "Red 29");
    generateTeam(30, "Red 30");
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