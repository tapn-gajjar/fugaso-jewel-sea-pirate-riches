import {WindowsBase} from "../../casino/gui/WindowsBase";
import {AppConst} from "../../casino/AppConst";
import {AppG} from "../../casino/AppG";
import {GameConstStatic} from "../GameConstStatic";

export class IntroWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_INTRO;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDIntro");

        this._isGraphic = false;
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);

        const m = AppG.isScreenPortrait ? "v_" : "m_";
        const scaleBGx = OMY.Omy.WIDTH / this._bg.json[m + "i_width"];
        const scaleBGy = OMY.Omy.HEIGHT / this._bg.json[m + "i_height"];
        this._bg.scale.set(Math.max(scaleBGx, scaleBGy));

        if (this._tint) {
            this._tint.x = -this.x;
            this._tint.y = -this.y;
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
        }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);

        /** @type {OMY.OContainer} */
        this._bg = this.getChildByName("c_game_bg");
        this._bg.input = true;
        /** @type {OMY.OActorSpine} */
        this._actor = this.getChildByName("a_logo_intro");
        this._actor.alpha = 0;

        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        AppG.sizeEmmit.off(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._isGraphic = false;
        this._bg = null;
        this._actor = null;

        if (this._tint)
            this._tint = null;
        this.callAll("destroy");
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
    }

    _onRevive() {
        super._onRevive();

        OMY.Omy.sound.play(GameConstStatic.S_intro);
        this._actor.alpha = 1;
        this._actor.play();
        this._actor.addComplete(this._onPlaySpine, this, true);
    }

    kill(onComplete = null) {
        if (this._isGraphic) {
            this._isOpen = false;
        }
        super.kill(onComplete);
    }

    _onKill() {
        if (this._isGraphic) {
            this._clearGraphic();
        }
        super._onKill();
    }

    /**     * @private     */
    _onPlaySpine() {
        AppG.state.startNewSession();
        OMY.Omy.add.tween(this, {alpha: 0},
            this._gdConf["tween_alpha_time"], this._onClose.bind(this));
    }

    _onClose() {
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = false;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = true;
        }
    }
}
