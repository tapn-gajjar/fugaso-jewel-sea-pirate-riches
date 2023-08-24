import {GameConstStatic} from "../../GameConstStatic";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

export class WinMessageTurbo {
    constructor(graphic) {
        this.C_TYPE_WIN = "none";
        this.C_TYPE_BIG = "big";
        this.C_TYPE_EPIC = "epic";
        this.C_TYPE_MEGA = "mega";
        this.C_TYPE_SUPER = "super";

        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._graphic.visible = false;

        /** @type {OMY.OActorSpine} */
        this._aEffect = null;

        AppG.emit.on(AppConst.APP_SHOW_MESSAGE_WIN_TURBO, this._showSimpleWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_BIG_WIN_TURBO, this._showBigWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_EPIC_WIN_TURBO, this._showEpicWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_MEGA_WIN_TURBO, this._showMegaWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_SUPER_MEGA_WIN_TURBO, this._showSuperMegaWinMessage, this);

        this._txtWin = this._graphic.getChildByName("t_win");
        this._txtWin.showCent = true;
        this._txtWin.lastText = ",";

        /** @type {OMY.OContainer} */
        let tempCanvas = graphic.getChildByName("c_canvas") ?? graphic;
        /** @type {OMY.OContainer} */
        this._labelCanvas = tempCanvas.getChildByName("c_label");
        /** @type {OMY.OSprite} */
        this._label = this._labelCanvas.canvas.getChildByName("s_label");
        this._labelCanvas.kill();

        /** @type {OMY.OGraphic} */
        this._tint = graphic.getChildByName("r_tint");
        this._tint.visible = false;
        // this._tint.interactive = true;

        OMY.Omy.loc.addUpdate(this._locUpdate, this, false);
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._resize, this);
        this._winCoef = 0;
        this._timeHideMessage = this._gdConf["time_hide"];

        if (this._gdConf.hasOwnProperty("active_turbo_debug")) {
            this._debugMessage = true;
            const debConst = this._gdConf["active_turbo_debug"].split(":");
            AppG.winCredit = debConst[1];
            AppG.winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
            AppG.getTimeByWinValue(AppG.winCredit, AppG.gameConst.getData("gui_inc_conf"), true);
            switch (debConst[0]) {
                case this.C_TYPE_BIG: {
                    OMY.Omy.add.timer(0.6, this._showBigWinMessage, this);
                    break;
                }
                case this.C_TYPE_EPIC: {
                    OMY.Omy.add.timer(0.6, this._showEpicWinMessage, this);
                    break;
                }
                case this.C_TYPE_MEGA: {
                    OMY.Omy.add.timer(0.6, this._showMegaWinMessage, this);
                    break;
                }
                case this.C_TYPE_SUPER: {
                    OMY.Omy.add.timer(0.6, this._showSuperMegaWinMessage, this);
                    break;
                }

                default: {
                    OMY.Omy.add.timer(0.6, this._showSimpleWinMessage, this);
                    break;
                }
            }
        }
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------
    /**     * @private     */
    _resize() {
        this._tint && OMY.Omy.add.timer(0.001, this._updatePosOfTint, this, 3);
    }

    /**     * @private     */
    _updatePosOfTint() {
        let scale = 1 / this._graphic.scaleX;
        this._tint.width = OMY.Omy.WIDTH * scale;
        this._tint.height = OMY.Omy.HEIGHT * scale;
        this._tint.x = -this._graphic.x * scale;
        this._tint.y = -this._graphic.y * scale;
    }

    _showSimpleWinMessage() {
        this._showWinMessage(this.C_TYPE_WIN);
    }

    _showBigWinMessage() {
        this._showWinMessage(this.C_TYPE_BIG);
    }

    _showMegaWinMessage() {
        this._showWinMessage(this.C_TYPE_MEGA);
    }

    _showSuperMegaWinMessage() {
        this._showWinMessage(this.C_TYPE_SUPER);
    }

    _showEpicWinMessage() {
        this._showWinMessage(this.C_TYPE_EPIC);
    }

    _showBonusWinMessage() {
        this._showWinMessage("bonus");
    }

    /**
     * Show win message
     * @param {string} [winSize="big_win"]
     */
    _showWinMessage(winSize = "big") {
        OMY.Omy.info('win message on turbo. show. Type:', winSize);
        this._currentWinLvl = this._maxWinType = winSize;

        if (this._graphic.visible) {
            OMY.Omy.sound.stop(GameConstStatic.S_big_win);
            this._lineTimer?.destroy();
            this._lineTimer = null;
            this._timerHideDelay?.destroy();
            this._timerHideDelay = null;
            OMY.Omy.remove.tween(this._tint);
            this._tint.visible = false;
        } else {
            this._txtWin.alpha = 0;
            this._txtWin.scale.set(0);
        }

        this._graphic.visible = true;
        this._txtWin.visible = true;
        OMY.Omy.remove.tween(this._txtWin);
        OMY.Omy.remove.tween(this._labelCanvas);
        this._labelCanvas.kill();
        this._tint.visible = true;
        this._tint.alpha = 0;

        this._txtWin.setNumbers(AppG.winCredit, false);
        let pos;
        switch (this._maxWinType) {
            case this.C_TYPE_SUPER:
            case this.C_TYPE_MEGA:
            case this.C_TYPE_EPIC:
            case this.C_TYPE_BIG: {
                AppG.forceIncTimeTake = AppG.gameConst.forceTurboBigWin;
                AppG.showWinTime = AppG.gameConst.forceTurboBigWin;
                this._screenDelay = this._gdConf["screen_big_turbo_delay"];

                pos = this._gdConf["position"]["big"];
                OMY.Omy.sound.play(GameConstStatic.S_big_win);

                this._labelCanvas.revive();
                this._labelCanvas.alpha = 0;
                this._labelCanvas.scale.set(0);
                OMY.Omy.add.tween(this._labelCanvas, {
                    alpha: 1,
                    scaleX: 1, scaleY: 1,
                    ease: "back.out(1.7)",
                }, this._gdConf["time_show"] - 0.2, null);
                this._checkLock();
                break;
            }

            default: {
                AppG.forceIncTimeTake = AppG.gameConst.forceTurboWin;
                AppG.showWinTime = AppG.gameConst.forceTurboWin;
                this._screenDelay = this._gdConf["screen_turbo_delay"];
                pos = this._gdConf["position"]["none"];
            }
        }
        this._txtWin.setXY(pos.x, pos.y);
        this._txtWin.json.x = pos.x;
        this._txtWin.json.y = pos.y;
        OMY.Omy.add.tween(this._txtWin, {
            alpha: 1,
            scaleX: 1, scaleY: 1,
            ease: "back.out(1.7)",
        }, this._gdConf["time_show"], null);

        OMY.Omy.add.tween(this._tint, {alpha: 1}, 0.3);
        AppG.emit.emit(AppConst.APP_START_INC_WIN, AppG.winCredit, AppG.showWinTime);
        if (!this._debugMessage)
            this._lineTimer = OMY.Omy.add.timer(AppG.showWinTime, this._hideWinMessage, this);

        AppG.updateGameSize(this._graphic);
        this._resize();
        AppG.emit.emit(AppConst.APP_SHOW_WIN, (AppG.isRespin) ? AppG.totalWinInSpin : AppG.winCredit, true);
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

    _hideWinMessage() {
        this._lineTimer?.destroy();
        this._lineTimer = null;
        this._timerHideDelay = OMY.Omy.add.timer(this._screenDelay, this._delayHideMess, this);
        AppG.emit.emit(AppConst.APP_HIDE_MESSAGE_WIN);
        AppG.emit.emit(AppConst.APP_STOP_WIN_PARTICLES);
        // AppG.emit.emit(GameConstStatic.WIN_MESSAGE_HIDE);
    }

    /**     * @private     */
    _delayHideMess() {
        OMY.Omy.remove.tween(this._txtWin);
        OMY.Omy.remove.tween(this._labelCanvas);
        this._timerHideDelay = null;
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_big_win)) {
            OMY.Omy.sound.stop(GameConstStatic.S_big_win);
            OMY.Omy.sound.play(GameConstStatic.S_big_win_END);
        }

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
        this._tint.visible && OMY.Omy.add.tween(this._tint, {alpha: 0}, 0.3);

    }

    _messageClear() {
        OMY.Omy.info('win message turbo. hide');

        OMY.Omy.remove.tween(this._txtWin);
        OMY.Omy.remove.tween(this._labelCanvas);
        OMY.Omy.remove.tween(this._tint);
        this._labelCanvas.kill();
        this._tint.visible = false;

        this._graphic.visible = false;
    }
}
