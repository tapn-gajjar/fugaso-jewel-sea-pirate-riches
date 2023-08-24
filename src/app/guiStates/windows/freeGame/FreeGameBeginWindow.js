import {GameConstStatic} from "../../../GameConstStatic";
import {FreeGameBeginWindowBase} from "../../../../casino/gui/windows/FreeGameBeginWindowBase";
import {AppG} from "../../../../casino/AppG";

export class FreeGameBeginWindow extends FreeGameBeginWindowBase {
    constructor() {
        super();
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    _updateGameSize() {
        super._updateGameSize();

        if (this._pyramidBg) {
            const m = AppG.isScreenPortrait ? "v_" : "m_";
            const scaleBGx = OMY.Omy.WIDTH / this._pyramidBg.json[m + "i_width"];
            const scaleBGy = OMY.Omy.HEIGHT / this._pyramidBg.json[m + "i_height"];
            this._pyramidBg.scale.set(Math.max(scaleBGx, scaleBGy));
        }
        if (this._windowBg) {
            const m = AppG.isScreenPortrait ? "v_" : "m_";
            const scaleBGx = OMY.Omy.WIDTH / this._windowBg.json[m + "i_width"];
            const scaleBGy = OMY.Omy.HEIGHT / this._windowBg.json[m + "i_height"];
            this._windowBg.scale.set(Math.max(scaleBGx, scaleBGy));
        }
    }

    revive(onComplete = null) {
        super.revive(onComplete);
    }

    _createGraphic() {
        super._createGraphic();
        this._catchSymbol = AppG.serverWork.freeBonusSymbol || "G";

        /** @type {OMY.OContainer} */
        let tCountCanvas = this.getChildByName("c_free_info").getChildByName("c_count");
        tCountCanvas.canvas
            .getChildByName("t_free_counter").text = AppG.serverWork.totalFreeGame;
        tCountCanvas.alignContainer();

        /** @type {OMY.OButton} */
        this._btnStart = this.getChildByName("b_start");
        this._btnStart.visible = false;
        this._btnStart.isBlock = true;

        /** @type {OMY.OSprite} */
        this._windowBg = this.getChildByName("s_free_bg");
        this._windowBg.input = true;

        if (this._bonusTint)
            this._bonusTint.alpha = 0;

        if (AppG.serverWork.haveFreeOnStart) {
            this.getChildByName("c_pyramid").destroy();
            /*this._btnStart.visible = true;
            this._btnStart.isBlock = false;
            this._btnStart.externalMethod(this._hideWindow.bind(this));*/
            OMY.Omy.add.timer(this._gdConf["delay_show_pyramid"], this._hideWindow, this);
        } else {
            /** @type {OMY.OContainer} */
            this._pyramid = this.getChildByName("c_pyramid");
            this._pyramidBg = this._pyramid.getChildByName("s_bg");
            /** @type {OMY.OActorSpine} */
            this._pyramidActor = this._pyramid.getChildByName("a_pyramid_bonus");
            this._pyramidActor.setSkin(this._pyramidActor.json["skins"][this._catchSymbol]);
            this._pyramid.alpha = 0;
            OMY.Omy.add.timer(this._gdConf["delay_show_pyramid"], this._onStartChangeSymbol, this);
            // this._onStartChangeSymbol();
        }
    }

    _clearGraphic() {
        this._windowBg = null;
        this._btnStart = null;
        this._pyramidActor = null;
        this._pyramidBg = null;
        super._clearGraphic();
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _updateLoc() {
        let lang = OMY.Omy.language.toLocaleLowerCase();
        // "local_mask":"choose_a_hat_%s"
        // this._chooseText.texture = OMY.StringUtils.sprintf(this._chooseText.json["local_mask"], lang);
    }

    _activateWindow() {
        super._activateWindow();

        this.alpha = 0;
        OMY.Omy.add.tween(this, {
            alpha: 1,
        }, this._gdConf["time_alpha"]);
        OMY.Omy.sound.play(GameConstStatic.S_fg_start);
        if (this._bonusTint)
            OMY.Omy.add.tween(this._bonusTint, {
                alpha: this._bonusTint.json["alpha"],
            }, this._bonusTint.json["time_tween"]);
    }

    /**     * @private     */
    _onStartChangeSymbol() {
        OMY.Omy.add.tween(this._pyramid, {
            alpha: 1,
        }, this._pyramidActor.json["time_tween"]/*, this._onStartChangeSymbol.bind(this)*/);
        this._pyramidActor.play();
        this._pyramidActor.addComplete(this._onPlayStartAnimation, this, true);
        OMY.Omy.sound.play(GameConstStatic.S_music_choise_bonus_symbol);
    }

    /**     * @private     */
    _onPlayStartAnimation() {
        OMY.Omy.sound.stop(GameConstStatic.S_music_choise_bonus_symbol);
        this.getChildByName("c_free_info").renderable = false;
        this._windowBg.renderable = false;
        this._pyramidActor.gotoAndPlay(0, false, this._pyramidActor.json["case_symbol"]);
        this._pyramidActor.addComplete(this._onSymbolCatch, this, true);
        OMY.Omy.add.timer(0.3, () => {
            OMY.Omy.sound.play(GameConstStatic.choise_symbol_final_ + String(OMY.OMath.randomRangeInt(1, 5)));
        }, this);
        OMY.Omy.sound.play(GameConstStatic.S_on_choise_bonus_symbol);
    }

    /**     * @private     */
    _onSymbolCatch() {
        OMY.Omy.add.timer(1, this._hideWindow, this);
        // OMY.Omy.add.timer(0.5, this._hideWindow, this);
        // this._btnStart.visible = true;
        // this._btnStart.isBlock = false;
        // this._btnStart.externalMethod(this._hideWindow.bind(this));

        // OMY.Omy.add.tween(this._pyramid, {alpha: 0}, 1, this._canRemovePyramid.bind(this));
    }

    /**     * @private     */
    _canRemovePyramid() {
        this._pyramid.destroy();
        this._pyramidActor = null;
        this._pyramidBg = null;
    }

    _hideWindow() {
        this._btnStart.isBlock = true;
        // OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        OMY.Omy.add.tween(this, {
            alpha: 0,
        }, this._gdConf["time_alpha"], this._closeWindow.bind(this));
        /* if (this._bonusTint) {
             OMY.Omy.add.tween(this._bonusTint, {
                 alpha: 0,
             }, this._bonusTint.json["time_tween"], this._closeWindow.bind(this));
         } else {
             this._closeWindow();
         }*/
    }
}
