import { Competition } from "./controller.js";
import { Match } from "./match.js";

export function show() {
    // Always on bottom
}

export function hide() {
    // Stays on bottom
}

/**
 * Refreshes the display.
 */
export function update() {
    let match = Competition.match;
    if (!match) return;
    updateTimer();
    if (!Competition.postMatch) { // Don't update live scores after match before showing results
        [match.red, match.blue].forEach(alliance =>
            updateMatchPanel(
                match.friendlyName, alliance.teamNumbers, alliance.number, match.isPlayoff(),
                alliance.matchPoints, alliance.filledCoralLevels,
                alliance.algae, alliance.coralRPThreshold, alliance.color
            )
        );
    }
}

// Separated to allow rendering match panel in control window
export function updateMatchPanel(
    matchName, teams, number, isPlayoff,
    matchPoints, filledCoralLevels,
    algae, coralRPThreshold, color
) {
    updateMatchName(matchName);
    updateTeams(...teams, number, isPlayoff, color);
    updateMatchPoints(matchPoints, color);
    updateCoralLevels(filledCoralLevels, coralRPThreshold, color);
    updateAlgae(algae, color);
}

export function startVideo() {
    console.log("Media devices:", navigator.mediaDevices.enumerateDevices());
    let video = document.querySelector("#stream video");
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { width: { exact: 1920 }, height: { exact: 1080 } } }).then(stream => {
            video.srcObject = stream;
        }).catch((e) => console.log("Could not find camera.", e));
    }
}

function updateTimer() {
    if (Competition.inMatch) {
        const MATCH_LENGTH = 150 * 1000; // milliseconds
        $("#timer #bar").width(((Competition.matchMillisElapsed / MATCH_LENGTH) * 100) + "%");
        $("#timer #time").text(Competition.friendlyMatchTime);
        if (Competition.inEndgame) $("#timer #bar").css("background-color", "yellow");
        else if (Competition.inAuto || Competition.inTeleop) $("#timer #bar").css("background-color", "green");
    } else {
        if (Competition.matchOver) {
            $("#timer #bar").css("background-color", "red");
            $("#timer #bar").width("100%");
        }
        else $("#timer #bar").width("0%");
        $("#timer #time").text("0");
    }
}

function updateMatchName(name) {
    $("#match-view #match-name").text(name);
}

function updateTeams(team1, team2, team3, number, isPlayoff, color) {
    let teams = $(`#match-view #match-panel #teams ${getColorClass(color)}`).children();
    [team1, team2, team3].forEach((teamNum, i) => teams.eq(i).text(teamNum));
    let allianceNumElement = $(`#match-view #match-panel #teams ${getColorClass(color)}.alliance-number`);
    if (isPlayoff) {
        allianceNumElement.text(number);
        allianceNumElement.show();
    } else {
        allianceNumElement.hide();
    }
}

function updateMatchPoints(points, color) {
    $(`#match-view #match-panel #score-box ${getColorClass(color)}`).text(points);
}

function updateAutonomous(leaves, color) {
    let indicators = $(`#match-view ${getColorClass(color)}.auto-panel .leave`);
    indicators.each((i, e) => {
        if (i < leaves) $(e).addClass("lit");
        else $(e).removeClass("lit");
    });
}

function updateCoralLevels(filledCoralLevels, coralRPThreshold, color) {
    $(`#match-view ${getColorClass(color)}.coral-panel .coral-count`).text(`${filledCoralLevels}/${coralRPThreshold}`);
}

function updateAlgae(algae, color) {
    $('#match-view ' + getColorClass(color) + '.coral-panel .algae-count').text(algae);
}

function updateStage(barge, trapNotes, harmony, color) {
    $(`#match-view ${getColorClass(color)}.barge-panel .robot`).each((i, e) => {
        $(e).removeClass("park onstage");
        if (barge[i] == Match.PointValues.PARK) $(e).addClass("park");
        else if (barge[i] == Match.PointValues.ONSTAGE) $(e).addClass("onstage");
    });
    $(`#match-view ${getColorClass(color)}.barge-panel .trap`).each((i, e) => {
        if (trapNotes[i]) $(e).show();
        else $(e).hide();
    });
    $(`#match-view ${getColorClass(color)}.barge-panel .harmony`).each((i, e) => {
        if (i < harmony) $(e).show();
        else $(e).hide();
    });
}

function getColorClass(color) {
    if (color == Match.AllianceColor.RED) return ".red";
    else if (color == Match.AllianceColor.BLUE) return ".blue";
    else throw "Color must be a Match.AllianceColor";
}

function getOpponentColorClass(color) {
    if (color == Match.AllianceColor.RED) return ".blue";
    else if (color == Match.AllianceColor.BLUE) return ".red";
    else throw "Color must be a Match.AllianceColor";
}