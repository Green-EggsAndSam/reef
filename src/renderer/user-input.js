import { Competition } from "./controller.js";
import { Match } from "./match.js";

const ipc = window.ipc;
const CtrlMsg = window.ipc.CtrlMsg;
const RenderMsg = window.ipc.RenderMsg;

ipc.on("view-match", () => Competition.showMatch());
ipc.on("view-results", () => Competition.showResults());
ipc.on("view-rankings", () => Competition.showRankings());

ipc.on("no-entry", () => Competition.noEntry());
ipc.on("do-not-enter", () => Competition.safeToEnter());
ipc.on("ready-for-match", () => Competition.readyForMatch());
ipc.on("start-match", () => Competition.startMatch());

ipc.on("field-fault", () => Competition.fieldFault());
ipc.on("replay-match", () => Competition.replayMatch());
ipc.on("save-results", () => Competition.saveResults());
ipc.on("next-match", () => Competition.nextMatch());
ipc.on("previous-match", () => Competition.previousMatch());

// Points
ipc.on(CtrlMsg.LEAVE, (_, data) => {
    if (data.red) Competition.match.red.setLeaves(data.count);
    else Competition.match.blue.setLeaves(data.count);
});

ipc.on(CtrlMsg.CORALL1, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
    if (data.type == "auto") {
        if (data.undo) alliance.removeAutoCoralL1();
        else alliance.addAutoCoralL1();
    } else if (data.type == "tele") {
        if (data.undo) alliance.removeTeleopCoralL1();
        else alliance.addTeleopCoralL1();
    } else if (data.type == "context") {
        if (data.undo) alliance.removeCoralL1();
        else alliance.addCoralL1();
    }
});
ipc.on(CtrlMsg.CORALL2, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
    if (data.type == "auto") {
        if (data.undo) alliance.removeAutoCoralL2();
        else alliance.addAutoCoralL2();
    } else if (data.type == "tele") {
        if (data.undo) alliance.removeTeleopCoralL2();
        else alliance.addTeleopCoralL2();
    } else if (data.type == "context") {
        if (data.undo) alliance.removeCoralL2();
        else alliance.addCoralL2();
    }
});
ipc.on(CtrlMsg.CORALL3, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
    if (data.type == "auto") {
        if (data.undo) alliance.removeAutoCoralL3();
        else alliance.addAutoCoralL3();
    } else if (data.type == "tele") {
        if (data.undo) alliance.removeTeleopCoralL3();
        else alliance.addTeleopCoralL3();
    } else if (data.type == "context") {
        if (data.undo) alliance.removeCoralL3();
        else alliance.addCoralL3();
    }
});
ipc.on(CtrlMsg.CORALL4, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
    if (data.type == "auto") {
        if (data.undo) alliance.removeAutoCoralL4();
        else alliance.addAutoCoralL4();
    } else if (data.type == "tele") {
        if (data.undo) alliance.removeTeleopCoralL4();
        else alliance.addTeleopCoralL4();
    } else if (data.type == "context") {
        if (data.undo) alliance.removeCoralL4();
        else alliance.addCoralL4();
    }
});

ipc.on(CtrlMsg.PROCESSOR, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
     if (data.undo) alliance.removeProcessor();
        else alliance.addProcessor();
});
ipc.on(CtrlMsg.NET, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
    if (data.undo) alliance.removeNet();
    else alliance.addNet();
});
ipc.on(CtrlMsg.ABYSS, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
    if (data.undo) alliance.removeAbyss();
    else alliance.addAbyss();
});

ipc.on(CtrlMsg.COOP, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
    if (data.force) alliance.setCoopertitionForce(!data.undo);
    else alliance.setCoopertition();
});

const bargeMap = { 0: 0, 1: Match.PointValues.PARK, 2: Match.PointValues.DEEP };
ipc.on(CtrlMsg.BARGE, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
    alliance.setBarge(data.position, bargeMap[data.level]);
});

ipc.on(CtrlMsg.FOUL, (_, data) => {
    let alliance = data.red ? Competition.match.red : Competition.match.blue;
    if (!data.tech && !data.undo) alliance.addFoul();
    if (!data.tech && data.undo) alliance.removeFoul();
    if (data.tech && !data.undo) alliance.addTechFoul();
    if (data.tech && data.undo) alliance.removeTechFoul();
});

export function matchEnded() {
    ipc.send("match-ended");
}

export function loadedUndeterminedMatch() {
    ipc.send("loaded-undetermined-match");
}

export function loadedDeterminedMatch() {
    ipc.send("loaded-determined-match");
}

export function sendMatchData() {
    let data = {
        matchName: Competition.match.friendlyName,
        isPlayoff: Competition.match.isPlayoff()
    };
    [["red", Competition.match.red], ["blue", Competition.match.blue]].forEach(arr => {
        let [key, alliance] = arr;
        data[key] = {
            teams: alliance.teamNumbers,
            number: alliance.number,
            fouls: alliance.fouls,
            techFouls: alliance.techFouls,
            autoCoralL1: alliance.autoCoralL1,
            autoCoralL2: alliance.autoCoralL2,
            autoCoralL3: alliance.autoCoralL3,
            autoCoralL4: alliance.autoCoralL4,
            coralL1: alliance.coralL1,
            coralL2: alliance.coralL2,
            coralL3: alliance.coralL3,
            coralL4: alliance.coralL4,
            processor: alliance.processor,
            net: alliance.net,
            abyss: alliance.abyss,
            barge: alliance.barge,

            coralRP: alliance.coralRP,
            autoRP: alliance.autoRP,
            bargeRP: alliance.bargeRP,

            matchPoints: alliance.matchPoints,
            leaves: alliance.leaves,
            algae: alliance.algae,
            coralRPThreshold: alliance.coralRPThreshold,
            filledCoralLevels: alliance.filledCoralLevels,
            coopertition: alliance.coopertition,
            barge: alliance.barge,
            color: alliance.color
        }
    });
    ipc.send("match-data", data);
}