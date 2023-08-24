import {WinMessageBase} from "../../../casino/display/win/WinMessageBase";
import {GameConstStatic} from "../../GameConstStatic";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

export class WinMessage extends WinMessageBase {
    constructor(graphic) {
        super(graphic);
        /** @type {OMY.OContainer} */
        this._labelCanvas = graphic.getChildByName("c_label");
        /** @type {OMY.OSprite} */
        this._label = this._labelCanvas.canvas.getChildByName("s_label");
        this._labelCanvas.kill();
        /** @type {OMY.ORevoltParticleEmitter} */
        this._coins = graphic.getChildByName("re_coins_top");
        this._coins.kill();
        this._tint = graphic.getChildByName("r_tint");
        this._tint.visible = false;

        OMY.Omy.loc.addUpdate(this._locUpdate, this, false);
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._resize, this);
        this._txtWin.lastText = ",";

    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------
    /**     * @private     */
    _resize() {
        if (this._coins.active) {
            this._coins.particle.settings.floorY = OMY.Omy.HEIGHT * 1.5;
        }

        OMY.Omy.add.timer(0.001, this._updatePosOfTint, this, 3);
    }

    /**     * @private     */
    _updatePosOfTint() {
        let scale = 1 / this._graphic.scaleX;
        this._tint.width = OMY.Omy.WIDTH * scale;
        this._tint.height = OMY.Omy.HEIGHT * scale;
        this._tint.x = -this._graphic.x * scale;
        this._tint.y = -this._graphic.y * scale;
    }

    /**
     * Show win message
     * @param {string} [winSize="big_win"]
     */
    _showWinMessage(winSize = "big") {
        this._resize();
        super._showWinMessage(winSize);
        this._skiping = false;
        this._txtWin.visible = true;

        this._txtWin.alpha = 0;
        this._txtWin.scale.set(0);
        this._txtWin.setNumbers(0, false);
        OMY.Omy.remove.tween(this._txtWin);
        this._labelCanvas.kill();
        AppG.emit.emit(AppConst.APP_START_INC_WIN, AppG.winCredit, AppG.incTimeTake);
        this._incAnim = false;
        this._tint.visible = true;
        this._tint.alpha = 0;

        // winSize = "d";
        switch (winSize) {
            case "big": {
                this._labelCanvas.revive();
                this._labelCanvas.alpha = 0;
                this._labelCanvas.scale.set(0);
                OMY.Omy.add.tween(this._labelCanvas, {
                    alpha: 1,
                    scaleX: 1, scaleY: 1,
                    ease: "back.out(1.7)",
                }, this._gdConf["time_show"] - 0.2, null);
                this._checkLock();
                const pos = this._gdConf["position"]["big"];
                this._txtWin.setXY(pos.x, pos.y);
                this._txtWin.json.x = pos.x;
                this._txtWin.json.y = pos.y;
                OMY.Omy.sound.play(GameConstStatic.S_big_win);
                OMY.Omy.sound.play(GameConstStatic.S_take_take, true);
                this._txtWin.incSecond = AppG.incTimeTake;
                this._txtWin.setNumbers(AppG.winCredit, true);
                this._incAnim = true;
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 1,
                    scaleX: 1, scaleY: 1,
                    ease: "back.out(1.7)",
                }, this._gdConf["time_show"], null);

                this._coins.revive();
                this._coins.particle.settings.floorY = OMY.Omy.HEIGHT * 1.5;
                this._coins.addCompleted(this._needClearCoin, this, false);
                this._coins.start();
                break;
            }

            default: {
                const pos = this._gdConf["position"]["none"];
                this._txtWin.setXY(pos.x, pos.y);
                this._txtWin.json.x = pos.x;
                this._txtWin.json.y = pos.y;
                OMY.Omy.sound.play(GameConstStatic.S_take_take, true);
                this._txtWin.incSecond = AppG.incTimeTake;
                this._txtWin.setNumbers(AppG.winCredit, true);
                this._incAnim = true;
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 1,
                    scaleX: 1, scaleY: 1,
                    ease: "back.out(1.7)",
                }, this._gdConf["time_show"], null);
                break;
            }
        }
        OMY.Omy.add.tween(this._tint, {alpha: 1}, 0.3);

        this._timeHideMessage = this._gdConf["time_hide"];
        this._lineTimer = OMY.Omy.add.timer(AppG.showWinTime, this._hideWinMessage, this);

        this._startHide = false;
    }

    /**     * @private     */
    _locUpdate() {
        this._checkLock();
    }

    /**     * @private     */
    _checkLock() {
        this._label.texture = this._label.json["locTexture"][AppG.language];
        this._labelCanvas.alignContainer();
    }

    /**     * @private     */
    _onCompleteIncBonus() {
        this._txtWin.onCompleteInc = null;
        AppG.emit.emit("close_show_message");
    }

    _onShowWinValue() {
        super._onShowWinValue();
    }

    _onCompleteIncWin() {
        if (this._incAnim) {
            this._incAnim = false;
            OMY.Omy.sound.stop(GameConstStatic.S_take_take);
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_big_win)) {
                OMY.Omy.sound.stop(GameConstStatic.S_big_win);
                OMY.Omy.sound.play(GameConstStatic.S_big_win_END);
            }
            this._txtWin.stopInctAnimation();
            this._txtWin.setNumbers(this._txtWin.value);

            AppG.emit.emit(AppConst.APP_SHOW_WIN, (AppG.isRespin) ? AppG.totalWinInSpin : AppG.winCredit, true);
            super._onCompleteIncWin();
        }
    }

    /**     * @private     */
    _skipWinAnimations() {
        if (!this._graphic.visible) return;
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_big_win)) {
            OMY.Omy.sound.stop(GameConstStatic.S_big_win);
            OMY.Omy.sound.play(GameConstStatic.S_big_win_END);
        }
        this._onCompleteIncWin();

        this._lineTimer?.destroy();
        this._skiping = true;
        OMY.Omy.remove.tween(this._txtWin);
        if (!this._startHide) {
            this._txtWin.alpha = 1;
            this._txtWin.scale.set(1);
            this._hideWinMessage();
        } else {
            super._hideWinMessage();
        }
    }

    /**     * @private     */
    _needClearCoin() {
        this._coins.kill();
    }

    _hideWinMessage() {
        if (this._gdConf["show_debug"]) return;
        this._onCompleteIncWin();

        this._coins.active && this._coins.stop();
        this._lineTimer?.destroy();
        this._startHide = true;
        OMY.Omy.remove.tween(this._txtWin);
        OMY.Omy.remove.tween(this._labelCanvas);
        this._timerHideDelay = OMY.Omy.add.timer(this._gdConf["screen_delay"], this._delayHideMess, this);
    }

    /**     * @private     */
    _delayHideMess() {
        this._timerHideDelay = null;
        OMY.Omy.add.tween(this._txtWin, {
            alpha: 0,
            scaleX: this._gdConf["hide_scale"], scaleY: this._gdConf["hide_scale"],
            ease: "none",
        }, this._timeHideMessage, this._messageClear.bind(this));
        if (this._labelCanvas.active) {
            OMY.Omy.add.tween(this._labelCanvas, {
                alpha: 0,
                ease: "none",
            }, this._timeHideMessage);
        }
        OMY.Omy.add.tween(this._tint, {alpha: 0}, 0.3);
    }

    _messageClear() {
        this._timerHideDelay?.destroy();
        this._lineTimer?.destroy();
        OMY.Omy.remove.tween(this._txtWin);
        OMY.Omy.remove.tween(this._labelCanvas);
        OMY.Omy.remove.tween(this._tint);
        this._labelCanvas.kill();
        this._tint.visible = false;
        super._hideWinMessage();
    }
}
