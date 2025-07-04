import { Team } from "./team.js"
import * as repository from "./match-repository.js" // TODO: Causes control window to import match-repository, which fails on running generate()
import * as sound from "./sound.js";

import { Competition } from "./controller.js" // Needed for match time-based scoring. TODO: Maybe match time should be tracked in Match instead of Competition.

/**
 * Holds match data. Uniquely identified by `match`, `set`, and `type`. Roughly keeps track of the
 * same data as the match page on The Blue Alliance.
 */
export class Match {

    #number;
    #set;
    #type;
    #id;

    #red;
    #blue;

    /** @type {Match.Result} */
    result;

    /**
     * @param {number} number the number of the match
     *                       (e.g. 9 for Qualification 9, 2 for Quarterfinal 3 Match 2)
     * @param {Match.Type} type the type for this match
     * @param {number} set if this is a playoff match, the set for the match
     *                     (e.g. 3 for Quarterfinal 3 Match 2), 0 for qualifications
     */
    constructor(number, type = Match.Type.QUALIFICATION, set = 0) {
        this.#number = number;
        this.#set = type == Match.Type.QUALIFICATION ? 0 : set;
        this.#type = type;
        this.#id = [number, set, type]; // This triple uniquely identifies a match
        this.#red = new Match.#Alliance(Match.AllianceColor.RED, this);
        this.#blue = new Match.#Alliance(Match.AllianceColor.BLUE, this);

        this.result = repository.getResult(...this.#id);
    }

    /**
     * Enum-like getter for possible match results.
     */
    static get Result() {
        return {
            UNDETERMINED: "Undetermined",
            RED_WIN: "Red win",
            TIE: "Tie",
            BLUE_WIN: "Blue win"
        }
    }

    /**
     * Enum-like getter for alliance colors.
     */
    static get AllianceColor() {
        return {
            RED: "Red",
            BLUE: "Blue"
        }
    }

    /**
     * Enum-like getter for match types.
     */
    static get Type() {
        return {
            QUALIFICATION: "Qualification",
            PLAYOFF: "Playoff",
            FINAL: "Final"
        }
    }

    static get PointValues() {
        return {
            LEAVE: 3,
            CORAL_L1: 2,
            AUTO_CORAL_L1: 3,
            CORAL_L2: 3,
            AUTO_CORAL_L2: 4,
            CORAL_L3: 4,
            AUTO_CORAL_L3: 6,
            CORAL_L4: 5,
            AUTO_CORAL_L4: 7,

            ALGAE_PROCESSOR: 4,
            ALGAE_NET: 5,
            ALGAE_ABYSS : 3,

            PARK: 2,
            DEEP: 8,

            FOUL: 2,
            TECH_FOUL: 5
        }
    }
    
    /**
     * Gets the number of this match (e.g. 9 for Qualification 9, 2 for Quarterfinal 3
     * Match 2)
     * @type {number}
     */
    get number() {
        return this.#number;
    }

    /**
     * Gets the set this match is apart of. Always 0 for qualification matches.
     * @type {number}
     */
    get set() {
        return this.#set;
    }

    /**
     * Gets the type of this match.
     * @type {Match.Type}
     */
    get type() {
        return this.#type;
    }

    /** @type {Match.Alliance} */
    get red() {
        return this.#red;
    }

    /** @type {Match.Alliance} */
    get blue() {
        return this.#blue;
    }

    /**
     * Gets this match's friendly name.
     */
    get friendlyName() {
        return this.type + " " + this.number;
    }

    /**
     * Gets all teams in this match in an array, with red teams first.
     * @type {Team[]}
     */
    get teams() {
        return this.#red.teams.concat(this.#blue.teams);
    }

    get teamNumbers() {
        return this.teams.map(team => team.number);
    }

    /**
     * Checks if the provided team is disqualified from this match.
     * 
     * @param {Team | number} team
     * @return {boolean} `true` if the provided team is disqualified, `false` otherwise.
     */
    isDisqualified(team) {
        if (team instanceof Team) {
            team = team.number;
        }
        if (this.teams.map(team => team.number).includes(team)) {
            return repository.isDisqualified(team, ...this.#id);
        }
        return false;
    }

    /**
     * Checks if the provided team is a surrogate in this match.
     * @param {Team | number} team
     * @return {boolean} `true` if the provided team is a surrogate, `false` otherwise.
     */
    isSurrogate(team) {
        if (team instanceof Team) {
            team = team.number;
        }
        if (this.teams.map(team => team.number).includes(team)) {
            return repository.isSurrogate(team, ...this.#id);
        }
        return false;
    }

    isPlayoff() {
        return this.#type == Match.Type.PLAYOFF || this.#type == Match.Type.FINAL;
    }

    determineResult() {
        if (this.red.matchPoints > this.blue.matchPoints) this.result = Match.Result.RED_WIN;
        else if (this.red.matchPoints < this.blue.matchPoints) this.result = Match.Result.BLUE_WIN;
        else this.result = Match.Result.TIE;
    }

    /**
     * Saves the state of this match to the repository.
     */
    save() {
        repository.setResult(this.result, ...this.#id);
        this.red.save();
        this.blue.save();
    }

    /**
     * Clears match data locally. Old match data stays in database until this match gets saved.
     */
    clear() {
        this.result = Match.Result.UNDETERMINED;
        this.red.clear();
        this.blue.clear();
    }

    /**
     * Gets the next match in the competition with an undetermined outcome.
     * @return {Match} the next match
     */
    static getNextMatch() {

        const PLAYOFF_STRUCTURE = {
            // 1vBye (1)
            // 1: 4v5 (2)
            // 2: 2v7 (3)
            // 3: 3v6 (4)
            // L2vBye (5)
            // 4: L2vL3 (6)
            // 5: 1vW1 (7)
            // 6: W2vW3 (8)
            // 7: L5vW4 (9)
            // 8: L6vL1 (10)
            // 9: W5vW6 (11)
            // 10: W8vW7 (12)
            // 11: L9vW10 (13)
            // 12: W9vW11 finals

            // 1: 4v5 (2)
            // 2: 2v7 (3)
            // 3: 3v6 (4)
            4: ["L", 2, "L", 3, Match.Type.PLAYOFF, 4],
            // 5: 1vW1
            6: ["W", 2, "W", 3, Match.Type.PLAYOFF, 6],
            7: ["L", 5, "W", 4, Match.Type.PLAYOFF, 7],
            8: ["L", 6, "L", 1, Match.Type.PLAYOFF, 8],
            9: ["W", 5, "W", 6, Match.Type.PLAYOFF, 9],
            10: ["W", 8, "W", 7, Match.Type.PLAYOFF, 10],
            11: ["L", 9, "W", 10, Match.Type.PLAYOFF, 11],
            12: ["W", 9, "W", 11, Match.Type.FINAL, 1],
        };

        let matches = this.getSortedMatches();
        let match = matches.find(match => match.result == Match.Result.UNDETERMINED);
        if (!match && matches[matches.length - 1].type == Match.Type.PLAYOFF) {

            function getAlliance(number, result) {
                let match = matches.find(match => match.isPlayoff() && match.number == number);
                if (result == "W" && match.result == Match.Result.RED_WIN
                    || result == "L" && match.result == Match.Result.BLUE_WIN) return match.red;
                else if (result == "W" && match.result == Match.Result.BLUE_WIN
                    || result == "L" && match.result == Match.Result.RED_WIN) return match.blue;
                else return false;
            }

            let matchData = PLAYOFF_STRUCTURE[matches[matches.length - 1].number + 1];
            if (!matchData) return matches[matches.length - 1];
            let redAlliance = getAlliance(matchData[1], matchData[0]);
            let blueAlliance = getAlliance(matchData[3], matchData[2]);
            if (!redAlliance || !blueAlliance) return matches[matches.length - 1]; // Give up for ties

            repository.generateMatch(matchData[5], 0, matchData[4], redAlliance.teamNumbers, blueAlliance.teamNumbers, redAlliance.number, blueAlliance.number);
            if (matchData[4] == Match.Type.FINAL) {
                repository.generateMatch(2, 0, matchData[4], redAlliance.teamNumbers, blueAlliance.teamNumbers, redAlliance.number, blueAlliance.number);
                repository.generateMatch(3, 0, matchData[4], redAlliance.teamNumbers, blueAlliance.teamNumbers, redAlliance.number, blueAlliance.number);
            }
            matches = this.getSortedMatches();
            match = matches.find(match => match.result == Match.Result.UNDETERMINED);
        }
        return match ? match : matches[matches.length - 1] // If matches have been played, just return the last one
    }

    /**
     * @return {Match[]}
     */
    static getSortedMatches() {
        let matches = repository.getAllMatches();
        matches.sort((m1, m2) => {
            if (m1.type == m2.type == Match.Type.QUALIFICATION) return m1.match - m2.match;
            else if (m1.type == m2.type) {
                // Order playoffs by match first, so Bo3s are spread out
                if (m1.number != m2.number) return m1.number - m2.number;
                else return m1.set - m2.set;
            }
            else if (m1.type == Match.Type.QUALIFICATION) return -1;
            else if (m2.type == Match.Type.QUALIFICATION) return 1;
            else if (m1.type == Match.Type.PLAYOFF) return -1;
            else if (m2.type == Match.Type.PLAYOFF) return 1;
            return 0; // Both matches are finals with the same set and match, shouldn't ever happen
        });
        return matches;
    }

    /**
     * Class to hold point data per alliance for Match.
     * 
     * Emulates something like a private inner class by passing in `match` for access to
     * the enclosing Match instance.
     */
    static #Alliance = class Alliance {

        #teams;
        #color;
        #match;
        #number; // 0 in qualifications

        /** @type {number} */    leaves = 0;
        /** @type {number} */    autoCoralL1 = 0;
        /** @type {number} */    autoCoralL2 = 0;
        /** @type {number} */    autoCoralL3 = 0;
        /** @type {number} */    autoCoralL4 = 0;
        /** @type {number} */    coralL1 = 0;
        /** @type {number} */    coralL2 = 0;
        /** @type {number} */    coralL3 = 0;
        /** @type {number} */    coralL4 = 0;
        /** @type {number} */    algaeProcessor = 0;
        /** @type {number} */    algaeNet = 0;
        /** @type {number} */    algaeAbyss = 0;

        /** @type {boolean} */   coopertition = false;
        /** @type {number[]} */  barge = [0,0,0]; // Point values of completed endgame tasks
        /** @type {number} */    fouls = 0; // Awarded to this alliance, committed by opponent
        /** @type {number} */    techFouls = 0; // Awarded to this alliance, committed by opponent


        setLeaves(count) { this.leaves = count; }

       
        addProcessor()    { this.algaeProcessor++};
        removeProcessor() { if (this.algaeProcessor > 0) { this.algaeProcessor--}};

        addNet()    { this.algaeNet++};
        removeNet() { if (this.algaeNet > 0) { this.algaeNet--}};

        addAbyss() {this.algaeAbyss++};
        removeAbyss() {if (this.algaeAbyss > 0) { this.algaeAbyss--}};

        addAutoCoralL1()      { this.autoCoralL1++; };
        removeAutoCoralL1()   { if (this.autoCoralL1 > 0) this.autoCoralL1--; };
        addTeleopCoralL1()    { this.coralL1++; };
        removeTeleopCoralL1() { if (this.coralL1 > 0) this.coralL1--; };

        addAutoCoralL2()      { this.autoCoralL2++; };
        removeAutoCoralL2()   { if (this.autoCoralL2 > 0) this.autoCoralL2--; };
        addTeleopCoralL2()    { this.coralL2++; };
        removeTeleopCoralL2() { if (this.coralL2 > 0) this.coralL2--; };

        addAutoCoralL3()      { this.autoCoralL3++; };
        removeAutoCoralL3()   { if (this.autoCoralL3 > 0) this.autoCoralL3--; };
        addTeleopCoralL3()    { this.coralL3++; };
        removeTeleopCoralL3() { if (this.coralL3 > 0) this.coralL3--; };

        addAutoCoralL4()      { this.autoCoralL4++; };
        removeAutoCoralL4()   { if (this.autoCoralL4 > 0) this.autoCoralL4--; };
        addTeleopCoralL4()    { this.coralL4++; };
        removeTeleopCoralL4() { if (this.coralL4 > 0) this.coralL4--; };


        addCoralL1() {
            if (Competition.inAuto) this.addAutoCoralL1();
            else this.addTeleopCoralL1();
        };
        removeCoralL1()        {
            if (Competition.inAuto) this.removeAutoCoralL1();
            else this.removeTeleopCoralL1();
        }

        addCoralL2() {
            if (Competition.inAuto) this.addAutoCoralL2();
            else this.addTeleopCoralL2();
        };
        removeCoralL2()        {
            if (Competition.inAuto) this.removeAutoCoralL2();
            else this.removeTeleopCoralL2();
        }

                addCoralL3() {
            if (Competition.inAuto) this.addAutoCoralL3();
            else this.addTeleopCoralL3();
        };
        removeCoralL3()        {
            if (Competition.inAuto) this.removeAutoCoralL3();
            else this.removeTeleopCoralL3();
        }

                addCoralL4() {
            if (Competition.inAuto) this.addAutoCoralL4();
            else this.addTeleopCoralL4();
        };
        removeCoralL4()        {
            if (Competition.inAuto) this.removeAutoCoralL4();
            else this.removeTeleopCoralL4();
        }

        setBarge(pos, pts) { this.barge[pos] = pts; }

        checkCoopertition() {
            if (Competition.inMatch && this.algaeProcessor >= 2 && !this.coopertition) {
                this.coopertition = true;
            }
        }
        setCoopertitionForce(bool) { this.coopertition = bool; }
        
        addFoul()                 { this.fouls++; }
        removeFoul()              { if (this.fouls > 0) this.fouls--; }
        addTechFoul()             { this.techFouls++; }
        removeTechFoul()          { if (this.techFouls > 0) this.techFouls--; }
        
        get teams() { return this.#teams; }
        get teamNumbers() { return this.#teams.map(team => team.number); }
        get color() { return this.#color; }
        get number() { return this.#number; }

        get matchPoints() {
            return this.leavePoints
                + this.coralPoints
                + this.algaePoints
                + this.bargePoints
                + this.penaltyPoints;
        }

        get autoPoints() {
            return this.autoCoralL1 * Match.PointValues.AUTO_CORAL_L1
                + this.autoCoralL2 * Match.PointValues.AUTO_CORAL_L2
                + this.autoCoralL3 * Match.PointValues.AUTO_CORAL_L3
                + this.autoCoralL4 * Match.PointValues.AUTO_CORAL_L4;
        }

        get leavePoints() {
            return this.leaves * Match.PointValues.LEAVE;
        }
        get coralPoints() {
            return this.autoCoralL1 * Match.PointValues.AUTO_CORAL_L1
                + this.coralL1 * Match.PointValues.CORAL_L1
                + this.autoCoralL2 * Match.PointValues.AUTO_CORAL_L2
                + this.coralL2 * Match.PointValues.CORAL_L2
                + this.autoCoralL3 * Match.PointValues.AUTO_CORAL_L3
                + this.coralL3 * Match.PointValues.CORAL_L3
                + this.autoCoralL4 * Match.PointValues.AUTO_CORAL_L4
                + this.coralL4 * Match.PointValues.CORAL_L4;
        }

        get algaePoints() {
            return this.algaeProcessor * Match.PointValues.ALGAE_PROCESSOR
                + this.algaeNet * Match.PointValues.ALGAE_NET
                + this.algaeAbyss * Match.PointValues.ALGAE_ABYSS;
        }

        get bargePoints() {
            return this.barge.reduce((sum, pts) => sum + pts, 0);
        }

        get penaltyPoints() {
            return this.fouls * Match.PointValues.FOUL
                + this.techFouls * Match.PointValues.TECH_FOUL;
        }
        
        get coopBonus() {
            return this.#match.#red.coopertition && this.#match.#blue.coopertition;
        }

        get autoRP() {
            return this.leaves >= 3 &&
             (this.autoCoralL1 + this.autoCoralL2 + this.autoCoralL3 + this.autoCoralL4) >= 1;
        }

        get coralRPThreshold() {
             return this.coopBonus ? 3 : 4;
        }

        get filledCoralLevels() {
            let fill = 0;
            if (this.coralL1 + this.autoCoralL1 >= 3) fill++;
            if (this.coralL2 + this.autoCoralL2 >= 3) fill++;
            if (this.coralL3 + this.autoCoralL3 >= 3) fill++;
            if (this.coralL4 + this.autoCoralL4 >= 3) fill++;
            return fill;
        }

        get algae() {
            return this.algaeProcessor + this.algaeNet + this.algaeAbyss;
        }

        get coralRP() {
            return this.filledCoralLevels >= this.coralRPThreshold;
        }

        get bargeRP() {
            return this.bargePoints >= 10;
        }
        /**
         * @param {number[]} teams 
         * @param {Match.AllianceColor} color 
         * @param {Match} match instance of Match enclosing this Alliance
         */
        constructor(color, match) {
            this.#color = color;
            this.#match = match;

            let teamNumbers = repository.getAllianceTeams(...this.#match.#id, this.color);
            this.#teams = teamNumbers.map(number => new Team(number));
            if (match.isPlayoff()) this.#number = repository.getAllianceNumber(...this.#match.#id, this.color);

            this.leaves            = repository.getLeaves(...this.#match.#id, this.color);
            this.autoCoralL1      = repository.getAutoCoralL1(...this.#match.#id, this.color);
            this.autoCoralL2      = repository.getAutoCoralL2(...this.#match.#id, this.color)
            this.autoCoralL3      = repository.getAutoCoralL3(...this.#match.#id, this.color);
            this.autoCoralL4      = repository.getAutoCoralL4(...this.#match.#id, this.color);
            this.coralL1          = repository.getCoralL1(...this.#match.#id, this.color);
            this.coralL2          = repository.getCoralL2(...this.#match.#id, this.color);
            this.coralL3          = repository.getCoralL3(...this.#match.#id, this.color);
            this.coralL4          = repository.getCoralL4(...this.#match.#id, this.color);
            this.algaeProcessor  = repository.getAlgaeProcessor(...this.#match.#id, this.color);
            this.barge          = repository.getBarge(...this.#match.#id, this.color);
            this.algaeNet         = repository.getAlgaeNet(...this.#match.#id, this.color);
            this.algaeAbyss       = repository.getAlgaeAbyss(...this.#match.#id, this.color);
            this.coopertition      = repository.getCoopertition(...this.#match.#id, this.color);
            this.fouls             = repository.getFouls(...this.#match.#id, this.color);
            this.techFouls         = repository.getTechFouls(...this.#match.#id, this.color);
        }

        save() {
            repository.setMatchPoints(this.matchPoints, ...this.#match.#id, this.color);
            repository.setLeaves(this.leaves, ...this.#match.#id, this.color);
            repository.setAutoCoralL1(this.autoCoralL1, ...this.#match.#id, this.color);
            repository.setAutoCoralL2(this.autoCoralL2, ...this.#match.#id, this.color);
            repository.setAutoCoralL3(this.autoCoralL3, ...this.#match.#id, this.color);
            repository.setAutoCoralL4(this.autoCoralL4, ...this.#match.#id, this.color);
            repository.setCoralL1(this.coralL1, ...this.#match.#id, this.color);
            repository.setCoralL2(this.coralL2, ...this.#match.#id, this.color);
            repository.setCoralL3(this.coralL3, ...this.#match.#id, this.color);
            repository.setCoralL4(this.coralL4, ...this.#match.#id, this.color);
            repository.setAlgaeProcessor(this.algaeProcessor, ...this.#match.#id, this.color);
            repository.setAlgaeNet(this.algaeNet, ...this.#match.#id, this.color);
            repository.setAlgaeAbyss(this.algaeAbyss, ...this.#match.#id, this.color);
            repository.setBarge(this.barge, ...this.#match.#id, this.color);
            repository.setCoopertition(this.coopertition, ...this.#match.#id, this.color);
            repository.setFouls(this.fouls, ...this.#match.#id, this.color);
            repository.setTechFouls(this.techFouls, ...this.#match.#id, this.color);
            repository.setAutoRP(this.autoRP, ...this.#match.#id, this.color);
            repository.setCoralRP(this.coralRP, ...this.#match.#id, this.color);
            repository.setBargeRP(this.bargeRP, ...this.#match.#id, this.color);
        }
        
        clear() {
            leaves = 0;
            autoCoralL1 = 0;
            autoCoralL2 = 0;
            autoCoralL3 = 0;
            autoCoralL4 = 0;
            coralL1 = 0;
            coralL2 = 0;
            coralL3 = 0;
            coralL4 = 0;
            algaeProcessor = 0;
            algaeNet = 0;
            algaeAbyss = 0;
            barge = [0, 0];
            coopertition = false;
            fouls = 0;
            techFouls = 0;
        }
    }
}