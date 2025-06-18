let CtrlMsg = {
    VIEW_MATCH:                 "view-match",
    VIEW_RESULTS:               "view-results",
    VIEW_RANKINGS:              "view-rankings",
    NO_ENTRY:                   "no-entry",
    SAFE_TO_ENTER:              "safe-to-enter",
    READY_FOR_MATCH:            "ready-for-match",
    START_MATCH:                "start-match",
    FIELD_FAULT:                "field-fault",
    REPLAY_MATCH:               "replay-match",
    SAVE_RESULTS:               "save-results",
    NEXT_MATCH:                 "next-match",
    PREVIOUS_MATCH:             "previous-match",

    LEAVE:                      "leave",        // Params: { red: bool, count: 0-3 }
    BARGE:                      "barge",        // Params: { red: bool, position: 0-2, level: 0-2 = (none, park, deep) }
    CORALL1:                    "coralL1",       // Params: { red: bool, type: string (context, auto, tele), undo: bool }
    CORALL2:                    "coralL2",       // Params: { red: bool, type: string (context, auto, tele), undo: bool }
    CORALL3:                    "coralL3",       // Params: { red: bool, type: string (context, auto, tele), undo: bool }
    CORALL4:                    "coralL4",       // Params: { red: bool, type: string (context, auto, tele), undo: bool }
    PROCESSOR:                  "processor",    // Params:  Params: { red: bool, type: string (context), undo: bool }
    NET:                        "net",          // Params:  Params: { red: bool, type: string (context), undo: bool }
    ABYSS:                      "abyss",        // Params: { red: bool, type: string (context), undo: bool }
    FOUL:                       "foul",         // Params: { red: bool, tech: bool, undo: bool }
}

let RenderMsg = {
    LOADED_UNDETERMINED_MATCH:  "loaded-undetermined-match",
    LOADED_DETERMINED_MATCH:    "loaded-determined-match",
    MATCH_ENDED:                "match-ended",
    MATCH_DATA:                 "match-data",
}

module.exports = { CtrlMsg, RenderMsg };