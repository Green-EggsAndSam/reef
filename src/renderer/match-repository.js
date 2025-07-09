/**
 * Saves and retrieves match data from a database.
 */

import { Match } from "./match.js"

var db = window.db;

// TODO: It's not a bottleneck, but should really cache the most recent match looked up

// Put manual db generation here
function generate() {
    generateMatch(1, 0, Match.Type.QUALIFICATION, [28, 4, 13], [22, 7, 1], 1, 8);
generateMatch(2, 0, Match.Type.QUALIFICATION, [10, 21, 20], [67, 18, 15], 1, 8);
generateMatch(3, 0, Match.Type.QUALIFICATION, [27, 6, 11], [12, 14, 25], 1, 8);
generateMatch(4, 0, Match.Type.QUALIFICATION, [99, 29, 9], [24, 3, 16], 1, 8);
generateMatch(5, 0, Match.Type.QUALIFICATION, [2, 17, 30], [19, 26, 5], 1, 8);
generateMatch(6, 0, Match.Type.QUALIFICATION, [18, 12, 4], [13, 67, 6], 1, 8);
generateMatch(7, 0, Match.Type.QUALIFICATION, [16, 10, 22], [25, 27, 20], 1, 8);
generateMatch(8, 0, Match.Type.QUALIFICATION, [7, 24, 29], [15, 5, 30], 1, 8);
generateMatch(9, 0, Match.Type.QUALIFICATION, [19, 3, 11], [2, 28, 21], 1, 8);
generateMatch(10, 0, Match.Type.QUALIFICATION, [1, 99, 26], [17, 9, 14], 1, 8);
generateMatch(11, 0, Match.Type.QUALIFICATION, [25, 5, 22], [4, 24, 67], 1, 8);
generateMatch(12, 0, Match.Type.QUALIFICATION, [6, 10, 18], [3, 28, 27], 1, 8);
generateMatch(13, 0, Match.Type.QUALIFICATION, [11, 17, 29], [9, 13, 12], 1, 8);
generateMatch(14, 0, Match.Type.QUALIFICATION, [21, 19, 14], [30, 20, 99], 1, 8);
generateMatch(15, 0, Match.Type.QUALIFICATION, [1, 15, 16], [26, 7, 2], 1, 8);
generateMatch(16, 0, Match.Type.QUALIFICATION, [4, 22, 11], [17, 18, 24], 1, 8);
generateMatch(17, 0, Match.Type.QUALIFICATION, [27, 5, 13], [99, 10, 19], 1, 8);
generateMatch(18, 0, Match.Type.QUALIFICATION, [26, 15, 25], [29, 3, 20], 1, 8);
generateMatch(19, 0, Match.Type.QUALIFICATION, [2, 16, 12], [21, 6, 1], 1, 8);
generateMatch(20, 0, Match.Type.QUALIFICATION, [14, 67, 28], [9, 30, 7], 1, 8);
generateMatch(21, 0, Match.Type.QUALIFICATION, [13, 26, 3], [99, 25, 24], 1, 8);
generateMatch(22, 0, Match.Type.QUALIFICATION, [4, 19, 6], [15, 29, 22], 1, 8);
generateMatch(23, 0, Match.Type.QUALIFICATION, [7, 16, 17], [67, 11, 10], 1, 8);
generateMatch(24, 0, Match.Type.QUALIFICATION, [12, 30, 28], [20, 2, 14], 1, 8);
generateMatch(25, 0, Match.Type.QUALIFICATION, [18, 1, 27], [5, 9, 21], 1, 8);
generateMatch(26, 0, Match.Type.QUALIFICATION, [6, 22, 99], [15, 11, 7], 1, 8);
generateMatch(27, 0, Match.Type.QUALIFICATION, [20, 28, 17], [16, 13, 25], 1, 8);
generateMatch(28, 0, Match.Type.QUALIFICATION, [5, 4, 29], [18, 21, 26], 1, 8);
generateMatch(29, 0, Match.Type.QUALIFICATION, [67, 19, 30], [1, 12, 3], 1, 8);
generateMatch(30, 0, Match.Type.QUALIFICATION, [24, 2, 9], [10, 14, 27], 1, 8);
generateMatch(31, 0, Match.Type.QUALIFICATION, [20, 6, 15], [28, 11, 5], 1, 8);
generateMatch(32, 0, Match.Type.QUALIFICATION, [30, 21, 3], [22, 13, 17], 1, 8);
generateMatch(33, 0, Match.Type.QUALIFICATION, [24, 27, 26], [29, 67, 1], 1, 8);
generateMatch(34, 0, Match.Type.QUALIFICATION, [9, 25, 18], [12, 7, 19], 1, 8);
generateMatch(35, 0, Match.Type.QUALIFICATION, [16, 14, 99], [10, 2, 4], 1, 8);
generateMatch(36, 0, Match.Type.QUALIFICATION, [5, 17, 67], [28, 29, 6], 1, 8);
generateMatch(37, 0, Match.Type.QUALIFICATION, [22, 12, 21], [11, 26, 9], 1, 8);
generateMatch(38, 0, Match.Type.QUALIFICATION, [14, 15, 24], [19, 18, 16], 1, 8);
generateMatch(39, 0, Match.Type.QUALIFICATION, [13, 20, 7], [27, 99, 2], 1, 8);
generateMatch(40, 0, Match.Type.QUALIFICATION, [3, 25, 10], [30, 1, 4], 1, 8);

    // generateMatch(1, 0, Match.Type.PLAYOFF, [], [], 1, 8);
    // generateMatch(2, 0, Match.Type.PLAYOFF, [], [], 4, 5);
    // generateMatch(3, 0, Match.Type.PLAYOFF, [], [], 3, 6);
    // generateMatch(4, 0, Match.Type.PLAYOFF, [], [], 2, 7);
}

$(generate);
/**
 * Creates a new match to be played and puts it in the database. Does not add the match
 * if a match with the same number, set, and type is already in the database.
 * @param {number} number the match number
 * @param {number} set the set the match is apart of
 * @param {Match.Type} type the match type
 * @param {number[]} redTeams an array of three team numbers
 * @param {number[]} blueTeams an array of three team number
 * @param {string} redAllianceName name to use for the red alliance in a playoff match
 * @param {string} blueAllianceName name to use for the blue alliance in a playoff match
 */
export function generateMatch(number, set, type, redTeams, blueTeams, redAllianceNumber = 0, blueAllianceNumber = 0, surrogates = []) {
    if (Object.keys(getMatchData(number, set, type)) == 0) {
        db.save({
            number: number,
            set: set,
            type: type,
            disqualifications: [],
            surrogates: surrogates,
            result: Match.Result.UNDETERMINED,

            redTeams: redTeams,
            redNumber: redAllianceNumber,
            redMatchPoints: 0,
            redLeaves: 0,
            redAutoCoralL1: 0,
            redAutoCoralL2: 0,
            redAutoCoralL3: 0,
            redAutoCoralL4: 0,
            redCoralL1: 0,
            redCoralL2: 0,
            redCoralL3: 0,
            redCoralL4: 0,
            redNet: 0,
            redProcessor: 0,
            redAbyss: 0,
            redCoopertition: false,
            redBarge: [0,0,0],
            redFouls: 0,
            redTechFouls: 0,
            redAutoRP: false,
            redCoralRP: false,
            redBargeRP: false,

            blueTeams: blueTeams,
            blueNumber: blueAllianceNumber,
            blueMatchPoints: 0,
            blueLeaves: 0,
            blueAutoCoralL1: 0,
            blueAutoCoralL2: 0,
            blueAutoCoralL3: 0,
            blueAutoCoralL4: 0,
            blueCoralL1: 0,
            blueCoralL2: 0,
            blueCoralL3: 0,
            blueCoralL4: 0,
            blueNet: 0,
            blueProcessor: 0,
            blueAbyss: 0,
            blueCoopertition: false,
            blueBarge: [0,0,0],
            blueFouls: 0,
            blueTechFouls: 0,
            blueAutoRP: false,
            blueCoralRP: false,
            blueBargeRP: false
        });
    }
}

/**
 * Builds and returns an array of all matches.
 * @return {Match[]}
 */
export function getAllMatches() {
    let matches = db.findAll();
    matches.forEach((e, i, a) => a[i] = new Match(e.number, e.type, e.set));
    return matches;
}

// Helper functions
function getMatchData(number, set, type) {
    return db.findOne({ number: number, set: set, type: type });
}

function lookupByAlliance(keyName, allianceColor, matchNumber, matchSet, matchType) {
    let matchData = getMatchData(matchNumber, matchSet, matchType);
    if (allianceColor == Match.AllianceColor.RED) return matchData["red" + keyName];
    else if (allianceColor == Match.AllianceColor.BLUE) return matchData["blue" + keyName];
    else throw "Color must be a Match.AllianceColor";
}

function updateDb(keyName, value, matchNumber, matchSet, matchType) {
    let change = {}
    change[keyName] = value;
    db.update(getMatchData(matchNumber, matchSet, matchType).id, change);
}

function updateByAlliance(keyName, value, allianceColor, matchNumber, matchSet, matchType) {
    let change = {};
    if (allianceColor == Match.AllianceColor.RED) change["red" + keyName] = value;
    else if (allianceColor == Match.AllianceColor.BLUE) change["blue" + keyName] = value;
    else throw "allianceColor must be a Match.AllianceColor";
    db.update(getMatchData(matchNumber, matchSet, matchType).id, change);
}

/**
 * Gets the alliance team numbers in the match with the specified number, type, and set.
 * @param {number} number the match number
 * @param {number} set the set the match is apart of
 * @param {Match.Type} type the match type
 * @param {Match.AllianceColor} color the color of the alliance
 * @return {number[]} an array of three red team numbers
 */
export function getAllianceTeams(number, set, type, color) { return lookupByAlliance("Teams", color, number, set, type); }
export function getAllianceNumber(number, set, type, color) { return lookupByAlliance("Number", color, number, set, type); }
export function getResult(number, set, type) { return getMatchData(number, set, type).result; }
export function setResult(result, number, set, type) { updateDb("result", result, number, set, type); }

/**
 * Checks if the specified team was disqualified from this match.
 * @param {number} teamNumber the team number to check for disqualification
 * @param {number} matchNumber the match number
 * @param {number} set the set the match is apart of
 * @param {Match.Type} type the match type
 * @return {boolean} whether the team was disqualified from this match
 */
export function isDisqualified(teamNumber, matchNumber, set, type) { return getMatchData(matchNumber, set, type).disqualifications.includes(teamNumber); }

/**
 * Checks if the specified team is a surrogate in this match.
 * @param {number} teamNumber the team number to check for surrogacy
 * @param {number} matchNumber the match number
 * @param {number} set the set the match is apart of
 * @param {Match.Type} type the match type
 */
export function isSurrogate(teamNumber, matchNumber, set, type) { return getMatchData(matchNumber, set, type).surrogates.includes(teamNumber); }

/**
 * Gets the number of match points scored by the specified alliance in the match.
 * @param {number} number the match number
 * @param {number} set the set the match is apart of
 * @param {Match.Type} type the match type
 * @param {Match.AllianceColor} color the alliance to get the value for
 * @return {number} the number of match points for this match
 */
export function getMatchPoints(number, set, type, color) { return lookupByAlliance("MatchPoints", color, number, set, type); }
export function setMatchPoints(points, number, set, type, color) { updateByAlliance("MatchPoints", points, color, number, set, type); }

export function getLeaves(number, set, type, color) { return lookupByAlliance("Leaves", color, number, set, type); }
export function setLeaves(mobility, number, set, type, color) { updateByAlliance("Leaves", mobility, color, number, set, type); }

export function getAutoCoralL1(number, set, type, color) { return lookupByAlliance("AutoCoralL1", color, number, set, type); }
export function setAutoCoralL1(autoCoralL1, number, set, type, color) { updateByAlliance("AutoCoralL1", autoCoralL1, color, number, set, type); }
export function getAutoCoralL2(number, set, type, color) { return lookupByAlliance("AutoCoralL2", color, number, set, type); }
export function setAutoCoralL2(autoCoralL2, number, set, type, color) { updateByAlliance("AutoCoralL2", autoCoralL2, color, number, set, type); }
export function getAutoCoralL3(number, set, type, color) { return lookupByAlliance("AutoCoralL3", color, number, set, type); }
export function setAutoCoralL3(autoCoralL3, number, set, type, color) { updateByAlliance("AutoCoralL3", autoCoralL3, color, number, set, type); }
export function getAutoCoralL4(number, set, type, color) { return lookupByAlliance("AutoCoralL4", color, number, set, type); }
export function setAutoCoralL4(autoCoralL4, number, set, type, color) { updateByAlliance("AutoCoralL4", autoCoralL4, color, number, set, type); }
export function getCoralL1(number, set, type, color) { return lookupByAlliance("CoralL1", color, number, set, type); }
export function setCoralL1(coralL1, number, set, type, color) { updateByAlliance("CoralL1", coralL1, color, number, set, type); }
export function getCoralL2(number, set, type, color) { return lookupByAlliance("CoralL2", color, number, set, type); }
export function setCoralL2(coralL2, number, set, type, color) { updateByAlliance("CoralL2", coralL2, color, number, set, type); }
export function getCoralL3(number, set, type, color) { return lookupByAlliance("CoralL3", color, number, set, type); }
export function setCoralL3(coralL3, number, set, type, color) { updateByAlliance("CoralL3", coralL3, color, number, set, type); }
export function getCoralL4(number, set, type, color) { return lookupByAlliance("CoralL4", color, number, set, type); }
export function setCoralL4(coralL4, number, set, type, color) { updateByAlliance("CoralL4", coralL4, color, number, set, type); }
export function getAlgaeNet(number, set, type, color) { return lookupByAlliance("AlgaeNet", color, number, set, type); }
export function setAlgaeNet(net, number, set, type, color) { updateByAlliance("AlgaeNet", net, color, number, set, type); }
export function getAlgaeProcessor(number, set, type, color) { return lookupByAlliance("AlgaeProcessor", color, number, set, type); }
export function setAlgaeProcessor(processor, number, set, type, color) { updateByAlliance("AlgaeProcessor", processor, color, number, set, type); }
export function getAlgaeAbyss(number, set, type, color) { return lookupByAlliance("AlgaeAbyss", color, number, set, type); }
export function setAlgaeAbyss(abyss, number, set, type, color) { updateByAlliance("AlgaeAbyss", abyss, color, number, set, type); }

export function getCoopertition(number, set, type, color) { return lookupByAlliance("Coopertition", color, number, set, type); }
export function setCoopertition(coopertition, number, set, type, color) { updateByAlliance("Coopertition", coopertition, color, number, set, type); }

export function getBarge(number, set, type, color) { return lookupByAlliance("Barge", color, number, set, type); }
export function setBarge(barge, number, set, type, color) { updateByAlliance("Barge", barge, color, number, set, type); }
export function getBargeRP(number, set, type, color) { return lookupByAlliance("BargeRP", color, number, set, type); }
export function setBargeRP(bargeRP, number, set, type, color) { updateByAlliance("BargeRP", bargeRP, color, number, set, type); }
export function getAutoRP(number, set, type, color) { return lookupByAlliance("AutoRP", color, number, set, type); }
export function setAutoRP(autoRP, number, set, type, color) { updateByAlliance("AutoRP", autoRP, color, number, set, type); }
export function getCoralRP(number, set, type, color) { return lookupByAlliance("CoralRP", color, number, set, type); }
export function setCoralRP(coralRP, number, set, type, color) { updateByAlliance("CoralRP", coralRP, color, number, set, type); }

/**
 * Gets the number of regular fouls awarded to the specified alliance as a result
 * of fouls committed by the opponent alliance in the match.
 * @param {number} number the match number
 * @param {number} set the set the match is apart of
 * @param {Match.Type} type the match type
 * @param {Match.AllianceColor} color the alliance to get the value for
 * @return {number} the number of regular fouls awarded in this match
 */
export function getFouls(number, set, type, color) { return lookupByAlliance("Fouls", color, number, set, type); }
export function setFouls(fouls, number, set, type, color) { return updateByAlliance("Fouls", fouls, color, number, set, type); }
export function getTechFouls(number, set, type, color) { return lookupByAlliance("TechFouls", color, number, set, type); }
export function setTechFouls(fouls, number, set, type, color) { return updateByAlliance("TechFouls", fouls, color, number, set, type); }