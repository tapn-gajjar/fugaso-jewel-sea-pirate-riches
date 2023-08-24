import {AppG} from "../../../../casino/AppG";
import {FreeInFreeWindowBase} from "../../../../casino/gui/windows/FreeInFreeWindowBase";
import {GameConstStatic} from "../../../GameConstStatic";

export class FreeInFreeWindow extends FreeInFreeWindowBase {
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

        this._bonusTint = this.getChildByName("r_bonus_tint");
        /** @type {OMY.OTextBitmap} */
        this._countFreeText = this.getChildByName("c_free_info").getChildByName("t_free_counter");

        OMY.Omy.sound.play(GameConstStatic.S_fg_in_free);
        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);

        if (this._bonusTint) {
            this._bonusTint.alpha = 0;
            OMY.Omy.add.tween(this._bonusTint, {
                alpha: this._bonusTint.json["alpha"],
            }, this._bonusTint.json["time_tween"]);
        }
        this._countFreeText.text = "+" + String(this._countMoreFree);
    }

    kill(onComplete = null) {
        OMY.Omy.loc.removeUpdate(this._updateLoc, this);
        this._countFreeText = null;

        this._bonusTint = null;
        this._isOpen = false;
        super.kill(onComplete);
        this.callAll("destroy");
    }

    _clearGraphic() {
        super._clearGraphic();
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _updateLoc() {
        let lang = OMY.Omy.language;
        // "local_mask":"choose_a_hat_%s"
        // this._chooseText.texture = OMY.StringUtils.sprintf(this._chooseText.json["local_mask"], lang);
    }

    _hideWindow() {
        OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);

        if (this._bonusTint) {
            OMY.Omy.add.tween(this._bonusTint, {
                alpha: 0,
            }, this._bonusTint.json["time_tween"], this._closeWindow.bind(this));
        } else {
            this._closeWindow();
        }
    }
}
