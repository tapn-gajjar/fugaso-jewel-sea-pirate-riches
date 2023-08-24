export const GameConstStatic = {
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 720,

    DESK_WIDTH: 1280,
    DESK_HEIGHT: 720,

    MOB_WIDTH: 1280,
    MOB_HEIGHT: 720,
    MOB_WIDTH_V: 540,
    MOB_HEIGHT_V: 960,

    SYMBOL_ON_REEL:"symbol_on_reel",

    S_btn_any: "btn_any",
    S_button_menu: "btn_any",
    S_btn_bet_minus: "btn_any",
    S_btn_bet_plus: "btn_any",
    S_take_take: "take-take",
    S_take_end: "win2balance",
    S_btn_bet_max: "btn_any",
    S_btn_reveal: "btn_start",
    S_btn_disable: "btn_any",
    S_btn_auto_off: "btn_any",
    S_btn_auto_on: "btn_any",

    S_reel_bg: "reelSpin",
    S_reel_respin_bg: "reSpin",
    S_reel_stop: "reel_stop",
    S_reel_stop_all: "reel_stop",
    S_quickStop: "quickStop",

    S_win_3: () => {
        return "win_1"/* + String(OMY.OMath.randomRangeInt(1, 3))*/;
    },
    S_win_4: () => {
        return "win_2"/* + String(OMY.OMath.randomRangeInt(1, 2))*/;
    },
    S_win_5: () => {
        return "win_3"/* + String(OMY.OMath.randomRangeInt(1, 2))*/;
    },

    S_game_bg: "",
    S_bg: "ambienceGeneral",
    S_bg_rs: "ambienceGeneral",
    S_bg_fg: "",
    S_fg_end: "",
    S_fg_start: "",
    S_fg_in_free: "",
    S_intro: "",

    S_bg_bonus: "",
    S_bonus_end: "",
    S_bonus_pick: "",

    S_respin_open: "wildExpansionSnd",
    S_respin_close: "wildRainbowExitSnd",
    S_wild_wait: "scatter_wait",
    S_wild_drop: "WILD DROP",
    S_wild_coins: "WILD COINS",
    S_fly_coins: "fx_short_flying-coin_vers06",

    S_JPWin: "JPWin",

    S_reel_scatter1: "",
    S_reel_scatter2: "",
    S_reel_scatter3: "",
    S_reel_scatter5: "",
    S_reel_scatter4: "",
    S_scatter_wait: "",

    S_big_win: "big_win",
    S_show_win_3: "smallWin",
    S_show_win_4: "mediumWin",
    S_show_win_5: "largeWin",

    S_big_win_END: "big win_ END"
};
