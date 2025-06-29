import * as teamRepository from "./team-repository.js"
import * as matchRepository from "./match-repository.js"

import { Match } from "./match.js"

/**
 * Holds team data. Uses `number` as a unique identifier.
 * Roughly keeps track of the same fields as The Blue Alliance's Rankings page.
 */
export class Team {

    #number;
    #name;

    #rankingPoints;
    #autoPoints;
    #bargePoints;
    #coopertitionPoints;
    #wins;
    #ties;
    #losses;
    #disqualifications;
    #matchesPlayed;

    constructor(number) {
        this.#number = number;
        this.#name = teamRepository.getTeamName(number);
    }

    get number() {
        return this.#number;
    }

    get name() {
        return this.#name;
    }

    calculateFields() {
        let matches = matchRepository.getAllMatches();
        matches = matches.filter(match => match.type == Match.Type.QUALIFICATION  && match.result != Match.Result.UNDETERMINED);
        matches = matches.filter(match => match.teamNumbers.includes(this.number) && !match.isSurrogate(this.number));
        this.#rankingPoints = 0;
        this.#autoPoints = 0;
        this.#bargePoints = 0;
        this.#wins = 0;
        this.#ties = 0;
        this.#losses = 0;
        this.#disqualifications = 0;
        matches.forEach(match => {
            if (match.isDisqualified(this.number)) {
                this.#disqualifications++;
            } else {
                if (match.red.teamNumbers.includes(this.number)) {
                    if (match.result == Match.Result.RED_WIN) {
                        this.#rankingPoints += 3;
                        this.#wins++;
                    } else if (match.result == Match.Result.TIE) {
                        this.#rankingPoints += 1;
                        this.#ties++;
                    } else {
                        this.#losses++;
                    }
                    if (match.red.coralRP) this.#rankingPoints += 1;
                    if (match.red.autoRP) this.#rankingPoints += 1;
                    if (match.red.bargeRP) this.#rankingPoints += 1;
                    if (match.red.coopBonus) this.#coopertitionPoints += 1;
                    this.#autoPoints += match.red.autoPoints;
                    this.#bargePoints += match.red.bargePoints;

                } else if (match.blue.teamNumbers.includes(this.number)) {
                    if (match.result == Match.Result.BLUE_WIN) {
                        this.#rankingPoints += 3;
                        this.#wins++;
                    } else if (match.result == Match.Result.TIE) {
                        this.#rankingPoints += 1;
                        this.#ties++;
                    } else {
                        this.#losses++;
                    }
                    if (match.blue.coralRP) this.#rankingPoints += 1;
                    if (match.blue.autoRP) this.#rankingPoints += 1;
                    if (match.blue.bargeRP) this.#rankingPoints += 1;
                    if (match.blue.coopBonus) this.#coopertitionPoints += 1;
                    this.#autoPoints += match.blue.autoPoints;
                    this.#bargePoints += match.blue.bargePoints;
                }
            }
        },
    );
        this.#matchesPlayed = matches.length;
        //Calculate averages for auto and barge points
        this.#autoPoints = this.#autoPoints / this.#matchesPlayed;
        this.#bargePoints = this.#bargePoints / this.#matchesPlayed;
    }

    get rankingScore() {
        return this.#rankingPoints / this.#matchesPlayed;
    }

    get rankingPoints() {
        return this.#rankingPoints;
    }

    get autoPoints() {
        return this.#autoPoints;
    }
    get bargePoints() {
        return this.#bargePoints;
    }

    get wins() {
        return this.#wins;
    }

    get ties() {
        return this.#ties;
    }

    get losses() {
        return this.#losses;
    }

    get disqualifications() {
        return this.#disqualifications;
    }

    get matchesPlayed() {
        return this.#matchesPlayed;
    }
}
