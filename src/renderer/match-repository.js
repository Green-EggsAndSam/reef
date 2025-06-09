/**
 * Saves and retrieves match data from a database.
 */

import { Match } from "./match.js"

var db = window.db;

// TODO: It's not a bottleneck, but should really cache the most recent match looked up

// Put manual db generation here
function generate() {
    generateMatch(1, 0, Match.Type.QUALIFICATION, [5, 12, 7], [3, 10, 15], 1, 8);
    generateMatch(2, 0, Match.Type.QUALIFICATION, [1, 4, 8], [6, 9, 11], 4, 5);
    generateMatch(3, 0, Match.Type.QUALIFICATION, [2, 13, 14], [0, 16, 17], 3, 6);
    generateMatch(4, 0, Match.Type.QUALIFICATION, [18, 19, 20], [21, 22, 23], 2, 7);
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
            redAlgaeNet: 0,
            redAlgaeProcessor: 0,
            redAlgaeAbyss: 0,
            redCoopertition: false,
            redBarge: [0,0],
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
            blueAlgaeNet: 0,
            blueAlgaeProcessor: 0,
            blueAlgaeAbyss: 0,
            blueCoopertition: false,
            blueBarge: [0,0],
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
export function setAutoCoralL1(AutoCoralL1, number, set, type, color) { updateByAlliance("AutoCoralL1", autoCoralL1, color, number, set, type); }
export function getAutoCoralL2(number, set, type, color) { return lookupByAlliance("AutoCoralL2", color, number, set, type); }
export function setAutoCoralL2(AutoCoralL2, number, set, type, color) { updateByAlliance("AutoCoralL2", autoCoralL2, color, number, set, type); }
export function getAutoCoralL3(number, set, type, color) { return lookupByAlliance("AutoCoralL3", color, number, set, type); }
export function setAutoCoralL3(AutoCoralL3, number, set, type, color) { updateByAlliance("AutoCoralL3", autoCoralL3, color, number, set, type); }
export function getAutoCoralL4(number, set, type, color) { return lookupByAlliance("AutoCoralL4", color, number, set, type); }
export function setAutoCoralL4(AutoCoralL4, number, set, type, color) { updateByAlliance("AutoCoralL4", autoCoralL4, color, number, set, type); }
export function getCoralL1(number, set, type, color) { return lookupByAlliance("CoralL1", color, number, set, type); }
export function setCoralL1(CoralL1, number, set, type, color) { updateByAlliance("CoralL1", coralL1, color, number, set, type); }
export function getCoralL2(number, set, type, color) { return lookupByAlliance("CoralL2", color, number, set, type); }
export function setCoralL2(CoralL2, number, set, type, color) { updateByAlliance("CoralL2", coralL2, color, number, set, type); }
export function getCoralL3(number, set, type, color) { return lookupByAlliance("CoralL3", color, number, set, type); }
export function setCoralL3(CoralL3, number, set, type, color) { updateByAlliance("CoralL3", coralL3, color, number, set, type); }
export function getCoralL4(number, set, type, color) { return lookupByAlliance("CoralL4", color, number, set, type); }
export function setCoralL4(CoralL4, number, set, type, color) { updateByAlliance("CoralL4", coralL4, color, number, set, type); }
export function getAlgaeNet(number, set, type, color) { return lookupByAlliance("AlgaeNet", color, number, set, type); }
export function setAlgaeNet(AlgaeNet, number, set, type, color) { updateByAlliance("AlgaeNet", algaeNet, color, number, set, type); }
export function getAlgaeProcessor(number, set, type, color) { return lookupByAlliance("AlgaeProcessor", color, number, set, type); }
export function setAlgaeProcessor(AlgaeProcessor, number, set, type, color) { updateByAlliance("AlgaeProcessor", algaeProcessor, color, number, set, type); }
export function getAlgaeAbyss(number, set, type, color) { return lookupByAlliance("AlgaeAbyss", color, number, set, type); }
export function setAlgaeAbyss(AlgaeAbyss, number, set, type, color) { updateByAlliance("AlgaeAbyss", algaeAbyss, color, number, set, type); }

export function getCoopertition(number, set, type, color) { return lookupByAlliance("Coopertition", color, number, set, type); }
export function setCoopertition(coopertition, number, set, type, color) { updateByAlliance("Coopertition", coopertition, color, number, set, type); }

export function getBarge(number, set, type, color) { return lookupByAlliance("Barge", color, number, set, type); }
export function setBarge(Barge, number, set, type, color) { updateByAlliance("Barge", barge, color, number, set, type); }
export function getBargeRP(number, set, type, color) { return lookupByAlliance("BargeRP", color, number, set, type); }
export function setBargeRP(BargeRP, number, set, type, color) { updateByAlliance("BargeRP", bargeRP, color, number, set, type); }
export function getAutoRP(number, set, type, color) { return lookupByAlliance("AutoRP", color, number, set, type); }
export function setAutoRP(AutoRP, number, set, type, color) { updateByAlliance("AutoRP", autoRP, color, number, set, type); }
export function getCoralRP(number, set, type, color) { return lookupByAlliance("CoralRP", color, number, set, type); }
export function setCoralRP(CoralRP, number, set, type, color) { updateByAlliance("CoralRP", coralRP, color, number, set, type); }

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