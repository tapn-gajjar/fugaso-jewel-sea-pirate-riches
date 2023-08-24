import {AppConst} from "../../../../casino/AppConst";
import {AppG} from "../../../../casino/AppG";
import {GameConstStatic} from "../../../GameConstStatic";
import {FreeGameEndWindowBase} from "../../../../casino/gui/windows/FreeGameEndWindowBase";

export class FreeGameEndWindow extends FreeGameEndWindowBase {
    constructor() {
        super();
    }

//---------------------------------------
// PUBLIC
//---------------------------------------

    revive(onComplete = null) {
        super.revive(onComplete);
    }

    _createGraphic() {
        super._createGraphic();

        this.getChildByName("c_free_info").getChildByName("t_total_win").setNumbers(this._totalWin);
        this._bonusTint = this.getChildByName("r_bonus_tint");

        /** @type {OMY.OSprite} */
        this._windowBg = this.getChildByName("s_free_bg");
        this._windowBg.input = true;

        if (this._bonusTint)
            this._bonusTint.alpha = 0;
    }

    _clearGraphic() {
        GameConstStatic.S_game_bg = GameConstStatic.S_bg;
        OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        this._windowBg = null;
        super._clearGraphic();
    }

    _updateGameSize() {
        super._updateGameSize();
        if (this._windowBg) {
            const m = AppG.isScreenPortrait ? "v_" : "m_";
            const scaleBGx = OMY.Omy.WIDTH / this._windowBg.json[m + "i_width"];
            const scaleBGy = OMY.Omy.HEIGHT / this._windowBg.json[m + "i_height"];
            this._windowBg.scale.set(Math.max(scaleBGx, scaleBGy));
        }
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _updateLoc() {
        let lang = OMY.Omy.language.toLocaleLowerCase();
        // "local_mask":"you_win_%s",
        // this._youWin.texture = OMY.StringUtils.sprintf(this._youWin.json["local_mask"], lang);
    }

    _activateWindow() {
        super._activateWindow();

        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        OMY.Omy.sound.play(GameConstStatic.S_fg_end);

        this.alpha = 0;
        OMY.Omy.add.tween(this, {
            alpha: 1,
        }, this._gdConf["time_alpha"]);

        /*OMY.Omy.add.tween(this._bonusTint, {
            delay: this._bonusTint.json["delay"],
            alpha: this._bonusTint.json["alpha"],
        }, this._bonusTint.json["time_tween"]);*/
    }

    _hideWindow() {
        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        OMY.Omy.add.tween(this, {
            alpha: 0,
        }, this._gdConf["time_alpha"], this._closeWindow.bind(this));
        /*if (this._bonusTint) {
            OMY.Omy.add.tween(this._bonusTint, {
                delay: this._bonusTint.json["delay"],
                alpha: 0,
            }, this._bonusTint.json["time_tween"], this._closeWindow.bind(this));
        } else {
            this._closeWindow();
        }*/
    }
}
