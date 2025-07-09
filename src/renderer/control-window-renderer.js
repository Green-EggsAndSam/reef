import { updateMatchPanel } from "./match-renderer.js";

const ipc = window.ipc;
const CtrlMsg = window.ipc.CtrlMsg;
const RenderMsg = window.ipc.RenderMsg;

const View = {
    MATCH: 1,
    RESULTS: 2,
    RANKINGS: 3
}

const Phase = {
    NO_ENTRY: 1,
    SAFE_TO_ENTER: 2,
    READY_FOR_MATCH: 3,
    IN_MATCH: 4
}

let view = View.MATCH;
let phase = Phase.NO_ENTRY;
let currentMatchDetermined = false;
let matchResultsWaiting = false;
let matchResultsValid = false;
let fault = false;

// View
$("#view button#match").on("click", () => {
    view = View.MATCH;
    ipc.send(CtrlMsg.VIEW_MATCH);
});
$("#view button#results").on("click", () => {
    view = View.RESULTS;
    ipc.send(CtrlMsg.VIEW_RESULTS)
});
$("#view button#rankings").on("click", () => {
    view = View.RANKINGS;
    ipc.send(CtrlMsg.VIEW_RANKINGS)
});

// Phase
$("#phase button#no-entry").on("click", () => {
    phase = Phase.NO_ENTRY;
    ipc.send(CtrlMsg.NO_ENTRY)
});
$("#phase button#safe-to-enter").on("click", () => {
    phase = Phase.SAFE_TO_ENTER;
    ipc.send(CtrlMsg.SAFE_TO_ENTER)
});
$("#phase button#ready-for-match").on("click", () => {
    phase = Phase.READY_FOR_MATCH;
    ipc.send(CtrlMsg.READY_FOR_MATCH)
});
$("#phase button#start-match").on("click", () => {
    phase = Phase.IN_MATCH;
    ipc.send(CtrlMsg.START_MATCH);
    $(".leave button, .barge button").removeClass("selected");
    $(".leave button.none, .barge button.none").addClass("selected");
});

// Match
$("#match button#field-fault").on("click", () => {
    phase = Phase.NO_ENTRY;
    fault = true;
    ipc.send(CtrlMsg.FIELD_FAULT);
});
$("#match button#replay-match").on("click", () => {
    currentMatchDetermined = false;
    matchResultsWaiting = false;
    fault = false;
    ipc.send(CtrlMsg.REPLAY_MATCH)
});
$("#match button#save-results").on("click", () => {
    matchResultsWaiting = false;
    matchResultsValid = true;
    ipc.send(CtrlMsg.SAVE_RESULTS);
});
$("#match button#next-match").on("click", () => ipc.send(CtrlMsg.NEXT_MATCH));
$("#match button#previous-match").on("click", () => ipc.send(CtrlMsg.PREVIOUS_MATCH));

// Points
$(".leave button, .barge button").on("click", e => {
    $(e.target).addClass("selected");
    $(e.target).siblings().removeClass("selected");
    let red = $(e.target).hasClass("red");
    if ($(e.target).parent().hasClass("leave")) { 
        ipc.send(CtrlMsg.LEAVE, { red: red, count: $(e.target).attr("value") });
    } else if ($(e.target).parent().hasClass("barge")) {
        let posMap = { "left": 0, "mid": 1, "right": 2 };
        let pos = posMap[Object.keys(posMap).find(pos => $(e.target).hasClass(pos))];
        let lvlMap = { "none": 0, "park": 1, "deep": 2 };
        let lvl = lvlMap[Object.keys(lvlMap).find(lvl => $(e.target).hasClass(lvl))];
        ipc.send(CtrlMsg.BARGE, { red: red, position: pos, level: lvl });
    }});

// Fouls
$("#fouls button").on("click", e => {
    let red = $(e.target).hasClass("blue"); // Award red fouls to blue and vice versa
    let tech = $(e.target).hasClass("tech");
    let undo = $(e.target).hasClass("remove");
    ipc.send(CtrlMsg.FOUL, { red: red, tech: tech, undo: undo });
});

let mods = {
    "ShiftLeft": false,
    "ShiftRight": false,
    "ControlLeft": false,
    "ControlRight": false
}
$(document).on("keydown", e => { if (e.code in mods) mods[e.code] = true; });
$(document).on("keyup", e => { if (e.code in mods) mods[e.code] = false; });

// TODO: Using control instead of shift because of weird shift keyup behavior, see https://stackoverflow.com/questions/62683548/why-does-shiftleft-not-trigger-a-keyup-event-while-shiftright-is-held-and-vi
const keyMap = {
    // Red
    "KeyG": ["coop",    "red", false, "ControlLeft"],
    "KeyF": ["coop",    "red", true,      "ControlLeft"],

    "KeyQ":      ["coralL1", "red", "context", "ControlLeft"],
    "KeyW":      ["coralL2", "red", "context", "ControlLeft"],
    "KeyE":      ["coralL3", "red", "context", "ControlLeft"],
    "KeyR":      ["coralL4", "red", "context", "ControlLeft"],

    "Digit1": ["coralL1", "red", "auto", "ControlLeft"],
    "Digit2": ["coralL2", "red", "auto", "ControlLeft"],
    "Digit3": ["coralL3", "red", "auto", "ControlLeft"],
    "Digit4": ["coralL4", "red", "auto", "ControlLeft"],

    "KeyZ":      ["processor", "red", "context", "ControlLeft"],
    "KeyX":      ["net",       "red", "context", "ControlLeft"],
    "KeyC":      ["abyss",     "red", "context", "ControlLeft"],

    // Blue
    "KeyJ": ["coop",    "blue", false, "ControlLeft"],
    "KeyK": ["coop",    "blue", true,      "ControlLeft"],

    "KeyU":      ["coralL1", "blue", "context", "ControlLeft"],
    "KeyI":      ["coralL2", "blue", "context", "ControlLeft"],
    "KeyO":      ["coralL3", "blue", "context", "ControlLeft"],
    "KeyP":      ["coralL4", "blue", "context", "ControlLeft"],

    "Digit7": ["coralL1", "blue", "auto", "ControlLeft"],
    "Digit8": ["coralL2", "blue", "auto", "ControlLeft"],
    "Digit9": ["coralL3", "blue", "auto", "ControlLeft"],
    "Digit0": ["coralL4", "blue", "auto", "ControlLeft"],

    "KeyB":      ["processor", "blue", "context", "ControlLeft"],
    "KeyN":      ["net",       "blue", "context", "ControlLeft"],
    "KeyM":      ["abyss",     "blue", "context", "ControlLeft"],
};

$(document).on("keydown", e => {
    if (e.ctrlKey && e.code === "KeyA") e.preventDefault(); // Eat Ctrl+A select all shortcut
    let args = keyMap[e.code];
    if (!args) return;
    if (args[0] == "coralL1") ipc.send(CtrlMsg.CORALL1, { red: args[1] == "red", type: args[2], undo: mods[args[3]] });
    else if (args[0] == "coralL2") ipc.send(CtrlMsg.CORALL2, { red: args[1] == "red", type: args[2], undo: mods[args[3]] });
    else if (args[0] == "coralL3") ipc.send(CtrlMsg.CORALL3, { red: args[1] == "red", type: args[2], undo: mods[args[3]] });
    else if (args[0] == "coralL4") ipc.send(CtrlMsg.CORALL4, { red: args[1] == "red", type: args[2], undo: mods[args[3]] });
    else if (args[0] == "processor") ipc.send(CtrlMsg.PROCESSOR, { red: args[1] == "red", type: args[2], undo: mods[args[3]] });
    else if (args[0] == "net") ipc.send(CtrlMsg.NET, { red: args[1] == "red", type: args[2], undo: mods[args[3]] });
    else if (args[0] == "abyss") ipc.send(CtrlMsg.ABYSS, { red: args[1] == "red", type: args[2], undo: mods[args[3]] });
    else if (args[0] == "coop") ipc.send(CtrlMsg.COOP, { red: args[1] == "red", force: args[2], undo: mods[args[3]] });
});

ipc.on(RenderMsg.LOADED_UNDETERMINED_MATCH, () => currentMatchDetermined = false);
ipc.on(RenderMsg.LOADED_DETERMINED_MATCH, () => currentMatchDetermined = true);
ipc.on(RenderMsg.MATCH_ENDED, () => {
    phase = Phase.NO_ENTRY;
    matchResultsWaiting = true;
    matchResultsValid = false;
});
ipc.on(RenderMsg.MATCH_DATA, (event, data) => {
    // Flip fouls to the alliance that caused them
    console.log("Match data received:");
    $("#data .red .fouls span").text(data.blue.fouls);
    $("#data .red .tech-fouls span").text(data.blue.techFouls);
    $("#data .blue .fouls span").text(data.red.fouls);
    $("#data .blue .tech-fouls span").text(data.red.techFouls);

    $("#data .red .auto-coralL1 span").text(data.red.autoCoralL1);
    $("#data .red .auto-coralL2 span").text(data.red.autoCoralL2);
    $("#data .red .auto-coralL3 span").text(data.red.autoCoralL3);
    $("#data .red .auto-coralL4 span").text(data.red.autoCoralL4);
    $("#data .red .coralL1 span").text(data.red.coralL1);
    $("#data .red .coralL2 span").text(data.red.coralL2);
    $("#data .red .coralL3 span").text(data.red.coralL3);
    $("#data .red .coralL4 span").text(data.red.coralL4);
    $("#data .red .processor span").text(data.red.processor);
    $("#data .red .net span").text(data.red.net);
    $("#data .red .abyss span").text(data.red.abyss);
    $("#data .red .coralRP span").text(data.red.coralRP);
    $("#data .red .autoRP span").text(data.red.autoRP);
    $("#data .red .bargeRP span").text(data.red.bargeRP);

   $("#data .blue .auto-coralL1 span").text(data.blue.autoCoralL1);
    $("#data .blue .auto-coralL2 span").text(data.blue.autoCoralL2);
    $("#data .blue .auto-coralL3 span").text(data.blue.autoCoralL3);
    $("#data .blue .auto-coralL4 span").text(data.blue.autoCoralL4);
    $("#data .blue .coralL1 span").text(data.blue.coralL1);
    $("#data .blue .coralL2 span").text(data.blue.coralL2);
    $("#data .blue .coralL3 span").text(data.blue.coralL3);
    $("#data .blue .coralL4 span").text(data.blue.coralL4);
    $("#data .blue .processor span").text(data.blue.processor);
    $("#data .blue .net span").text(data.blue.net);
    $("#data .blue .abyss span").text(data.blue.abyss);
    $("#data .blue .coralRP span").text(data.blue.coralRP);
    $("#data .blue .autoRP span").text(data.blue.autoRP);
    $("#data .blue .bargeRP span").text(data.blue.bargeRP);

    [data.red, data.blue].forEach(alliance => updateMatchPanel
        (
            data.matchName, alliance.teams, alliance.number, data.isPlayoff,
            alliance.matchPoints, alliance.filledCoralLevels, alliance.coopertition, alliance.algae, alliance.coralRPThreshold, alliance.color
        )
    );
});

function update() {
    if (!currentMatchDetermined && view == View.MATCH && phase == Phase.READY_FOR_MATCH) {
        $("#phase button#start-match").attr("disabled", false);
    } else {
        $("#phase button#start-match").attr("disabled", true);
    }

    if (phase == Phase.IN_MATCH) {
        $("#view button#results").attr("disabled", true);
        $("#view button#rankings").attr("disabled", true);
        $("#phase button#no-entry").attr("disabled", true);
        $("#phase button#safe-to-enter").attr("disabled", true);
        $("#match button#replay-match").attr("disabled", true);
        $("#match button#field-fault").attr("disabled", false);
    } else {
        $("#view button#results").attr("disabled", false);
        $("#view button#rankings").attr("disabled", false);
        $("#phase button#no-entry").attr("disabled", false);
        $("#phase button#safe-to-enter").attr("disabled", false);
        $("#match button#field-fault").attr("disabled", true);
    }

    if (phase == Phase.IN_MATCH || matchResultsWaiting) {
        $("#points button").attr("disabled", false);
        $("#fouls button").attr("disabled", false);
        $("#phase button#ready-for-match").attr("disabled", true);
        $("#match button#next-match").attr("disabled", true);
        $("#match button#previous-match").attr("disabled", true);
    } else {
        $("#points button").attr("disabled", true);
        $("#fouls button").attr("disabled", true);
        $("#phase button#ready-for-match").attr("disabled", false);
        $("#match button#next-match").attr("disabled", false);
        $("#match button#previous-match").attr("disabled", false);
    }

    if (fault) {
        $("#phase button#ready-for-match").attr("disabled", true);
        $("#match button#next-match").attr("disabled", true);
        $("#match button#previous-match").attr("disabled", true);
    }

    if (matchResultsWaiting) {
        $("#view button#results").attr("disabled", true);
        $("#match button#save-results").attr("disabled", false);
    } else {
        $("#match button#save-results").attr("disabled", true);
    }

    if (matchResultsValid) {
        $("#view button#results").attr("disabled", false);
    } else {
        $("#view button#results").attr("disabled", true);
    }

    if (currentMatchDetermined || matchResultsWaiting || fault) {
        $("#match button#replay-match").attr("disabled", false);
    } else {
        $("#match button#replay-match").attr("disabled", true);
    }
}

setInterval(update, 50);