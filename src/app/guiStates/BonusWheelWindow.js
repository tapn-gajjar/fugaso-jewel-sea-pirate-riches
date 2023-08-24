import {AppG} from "../../casino/AppG";
import {AppConst} from "../../casino/AppConst";
import {GameConstStatic} from "../GameConstStatic";
import {BonusWindowBase} from "../../casino/gui/windows/BonusWindowBase";

export class BonusWheelWindow extends BonusWindowBase {
    constructor() {
        super();

        this.PI_2 = Math.PI * 2;
        this._sectorsList = this._gdConf["sectors_list"];
        this._sectorSize = this.PI_2 / this._sectorsList.length;
    }

    //-------------------------------------------------------------------------
    // OVERRIDE
    //-------------------------------------------------------------------------

    revive(onComplete = null) {
        super.revive(onComplete);
        this._showWheel();
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _createGraphic() {
        if (this._isGraphic) return;
        super._createGraphic();

        this._loopRotate = false;

        this._cWheel = this.getChildByName("c_wheel");

        this._sWheelGlow = this._cWheel.getChildByName("s_wheel_glow");

        this._sWheelWinGlow = this._cWheel.getChildByName("s_wheel_win_glow");
        this._sWheelWinGlow.alpha = 0;

        /** @type {OMY.OActorSpine} */
        this._aDiamond = this._cWheel.getChildByName("a_diamond_shine");
        this._aDiamond.visible = false;

        this._cWheelCenter = this._cWheel.getChildByName("c_wheel_center");
        this._cWheelCenter.rotation = 0;

        this._txtBlock = this._cWheelCenter.getChildByName("c_values");

        this._sWinSector = this._cWheelCenter.getChildByName("s_yellow");
        this._sWinSector.visible = false;
        this._sWinWheelTint = this._cWheelCenter.getChildByName("s_wheel_tint");
        this._sWinWheelTint.visible = false;

        this._reFire = this.getChildByName("re_Fire");
        this._reFire.alpha = 0;
        this._sWinPanel = this.getChildByName("s_win_glow");
        this._sWinPanel.alpha = 0;
        this._sWinGlow = this.getChildByName("s_win_fire");
        this._sWinGlow.alpha = 0;
        this._sWinGlow.width = OMY.Omy.WIDTH;
        this._sWinGlow.height = OMY.Omy.HEIGHT;

        this._sWinMessage = this.getChildByName("s_win_message");
        this._sWinMessage.texture = this._sWinMessage.json["loc"][OMY.Omy.language];
        this._sWinMessage.alpha = 0;

        /** @type {OMY.OTextNumberBitmap} */
        this._txtWinValue = this.getChildByName("t_win_value");
        this._txtWinValue.setNumbers(0);
        this._txtWinValue.incSecond = this._txtWinValue.json["inc_second"];
        this._txtWinValue.alpha = 0;

        for (let i = 0, l = this._sectorsList.length; i < l; ++i) {
            const txtSector = this._txtBlock.getChildByName("t_sector_" + i);
            txtSector.text = String(this._sectorsList[i] * AppG.serverWork.totalBet);
        }

        // OMY.Omy.keys.registerFunction(OMY.Key.SPACE, this._onKeyHandler, this);

        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        super._clearGraphic();

        this._loopRotate = false;
        this._sWheelGlow?.tweenScale?.kill();

        this._sWinGlow?.tweenAlpha?.kill();
        this._sWinPanel?.tweenAlpha?.kill();
        this._sWinMessage?.tweenAlpha?.kill();
        this._txtWinValue?.tweenAlpha?.kill();
        this._txtWinValue?.tweenScale?.kill();

        this._cWheel = null;
        this._sWheelGlow = null;
        this._sWheelWinGlow = null;
        this._aDiamond = null;
        this._cWheelCenter = null;
        this._txtBlock = null;
        this._sWinSector = null;
        this._sWinWheelTint = null;
        this._sWinGlow = null;
        this._sWinPanel = null;
        this._sWinMessage = null;
        this._txtWinValue = null;
        this._reFire = null;
    }

    // /** @private */
    // _onKeyHandler() {
    //     this._startRotation();
    // }

    /**     * @private     */
    _showWheel() {
        OMY.Omy.sound.play(AppConst.S_wheel_start);
        this._cWheel.alpha = 0;
        const finishPos = this._cWheel.y;
        this._cWheel.y -= this._cWheel.json["dy"];
        OMY.Omy.add.tween(this._cWheel, {delay: this._cWheel.json["delay"], alpha: 1, y: finishPos},
            this._cWheel.json["time_tween"],
            this._startRotation.bind(this));
    }

    _startRotation() {
        if (AppG.isWarning) return;

        OMY.Omy.sound.play(AppConst.S_wheel_bg, true);
        this._reFire.alpha = 1;

        this._cWheelCenter.rotation = OMY.OMath.normAngle(this._cWheelCenter.rotation % this.PI_2);

        OMY.Omy.sound.play(AppConst.S_wheel_loop, true);

        const targetValue = AppG.serverWork.spinBonus?.shift() ?? 1;
        AppG.winCredit = AppG.serverWork.bonusValues?.shift() ?? 1;

        const listIndexes = [];
        for (let i = 0; i < this._sectorsList.length; i++) {
            if (targetValue === this._sectorsList[i]) {
                listIndexes.push(i);
            }
        }
        !listIndexes.length && listIndexes.push(0);
        this._targetIndex = OMY.OMath.getRandomItem(listIndexes);

        this.isUpdate = true;
        this._loopRotate = true;
        this._rSpeed = 0;
        this._canShowWin = false;
        OMY.Omy.add.timer(this._gdConf["time_wait_for_r"], this._onTimerMoveComplete, this);
        OMY.Omy.add.tween(this, {
            _rSpeed: this._gdConf["max_speed"],
            ease: "none",
        }, this._gdConf["grow_speed_time"]);
    }

    /**     * @private     */
    _onTimerMoveComplete() {
        OMY.Omy.remove.tween(this);
        this._canShowWin = true;
    }

    update() {
        super.update();
        if (this._loopRotate) {
            this._cWheelCenter.rotation += this._rSpeed;
            if (this._canShowWin) {
                this.isUpdate = false;
                this._loopRotate = false;

                const targetAngle = this.PI_2 + (this._sectorsList.length - this._targetIndex) * this._sectorSize;
                let count_PI = Math.floor(this._cWheelCenter.rotation / this.PI_2);
                this._cWheelCenter.rotation = this._cWheelCenter.rotation - this.PI_2 * count_PI;

                OMY.Omy.add.tween(this._cWheelCenter, {
                        rotation: targetAngle,
                        ease: "power2.out",
                    }, this._gdConf["rotation_sec"], this._endRotation.bind(this),
                );
            }
        }
    }

    _endRotation() {
        OMY.Omy.sound.stop(AppConst.S_wheel_bg);
        OMY.Omy.sound.stop(AppConst.S_wheel_loop);

        if (AppG.isWarning) return;

        OMY.Omy.sound.play(AppConst.S_wheel_sector);

        this._sWheelWinGlow.tweenAlpha = OMY.Omy.add.tween(this._sWheelWinGlow, {
            alpha: 1,
        }, this._sWheelWinGlow.json["alpha_sec"]);

        this._aDiamond.visible = true;
        this._aDiamond.addComplete(() => {
            this._aDiamond.play(true, "diamond_shine_loop");
        }, this, true);
        this._aDiamond.play(false, "diamond_shine_start");

        this._sWinWheelTint.visible = true;
        this._sWinSector.angle = this._sWinSector.json["rotate"][this._targetIndex];
        this._sWinSector.timerBlink = OMY.Omy.add.timer(0.15, () => {
            this._sWinSector.visible = !this._sWinSector.visible;
        }, this, 5, false);

        this._sWinSector.timerBlink = OMY.Omy.add.timer(0.15, () => {
            this._sWinSector.visible = !this._sWinSector.visible;
        }, this, 6, false, true, 1.5);

        OMY.Omy.add.timer(this._gdConf["delay_win_message_sec"], this._hideWheel, this);
    }

    /**     * @private     */
    _hideWheel() {
        OMY.Omy.viewManager.gameUI.hideBonusMes();
        this._sWinWheelTint.visible = false;
        OMY.Omy.add.tween(this._cWheel, {
                delay: this._cWheel.json["delay"],
                alpha: 0,
                y: this._cWheel.y - this._cWheel.json["dy"],
            },
            this._cWheel.json["time_tween"],
            this._showWinMessage.bind(this));
        OMY.Omy.add.tween(this._reFire, {
                alpha: 0,
            },
            this._cWheel.json["time_tween"]);
    }

    _showWinMessage() {
        if (AppG.isWarning) return;

        AppG.emit.emit(AppConst.EMIT_SHOW_WHEEL_WIN);

        // OMY.Omy.sound.play(AppConst.S_bonus_end);
        // OMY.Omy.sound.stop(AppConst.S_wheel_bg);
        OMY.Omy.sound.play(GameConstStatic.S_bigwin);

        this._cWheel.visible = false;

        this._sWinGlow.tweenAlpha = OMY.Omy.add.tween(this._sWinGlow, {
            alpha: 1,
        }, this._gdConf["show_win_message_sec"], () => this._sWinGlow.tweenAlpha = null);
        this._reFire.tweenAlpha = OMY.Omy.add.tween(this._reFire, {
            alpha: 1,
        }, this._gdConf["show_win_message_sec"], () => this._reFire.tweenAlpha = null);
        this._sWinPanel.tweenAlpha = OMY.Omy.add.tween(this._sWinPanel, {
            alpha: 1,
        }, this._gdConf["show_win_message_sec"], () => this._sWinPanel.tweenAlpha = null);

        this._sWinMessage.scale.set(0);
        this._sWinMessage.tweenAlpha = OMY.Omy.add.tween(this._sWinMessage, {
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
        }, this._gdConf["show_win_message_sec"], () => this._sWinMessage.tweenAlpha = null);
        this._txtWinValue.tweenAlpha = OMY.Omy.add.tween(this._txtWinValue, {
            alpha: 1,
            y: this._txtWinValue.y,
        }, this._gdConf["show_win_message_sec"], () => this._txtWinValue.tweenAlpha = null);
        this._txtWinValue.y += 20;
        this._txtWinValue.setNumbers(AppG.winCredit, true);
        this._txtWinValue.onCompleteInc = (taget) => {
            taget.tweenScale.kill();
            taget.tweenScale = null;
            taget.scale.set(1);
        };
        this._txtWinValue.tweenScale = OMY.Omy.add.tween(this._txtWinValue.scale, {
                x: 0.9,
                y: 0.9,
            }, 0.3, null,
            {
                repeat: -1,
                yoyo: true,
            });

        OMY.Omy.add.timer(this._gdConf["close_bonus_sec"], this._hideWinMess, this);
    }

    /**     * @private     */
    _hideWinMess() {
        this._sWinGlow.tweenAlpha = OMY.Omy.add.tween(this._sWinGlow, {
            alpha: 0,
        }, this._gdConf["hide_win_message_sec"], () => this._sWinGlow.tweenAlpha = null);
        this._reFire.tweenAlpha = OMY.Omy.add.tween(this._reFire, {
            alpha: 0,
        }, this._gdConf["hide_win_message_sec"], () => this._reFire.tweenAlpha = null);
        this._sWinPanel.tweenAlpha = OMY.Omy.add.tween(this._sWinPanel, {
            alpha: 0,
        }, this._gdConf["hide_win_message_sec"], () => this._sWinPanel.tweenAlpha = null);

        this._sWinMessage.tweenAlpha = OMY.Omy.add.tween(this._sWinMessage, {
            alpha: 0,
            y: this._sWinMessage.y - 100,
        }, this._gdConf["hide_win_message_sec"], () => this._sWinMessage.tweenAlpha = null);
        this._txtWinValue.tweenAlpha = OMY.Omy.add.tween(this._txtWinValue, {
            alpha: 0,
            y: this._txtWinValue.y + 100,
        }, this._gdConf["hide_win_message_sec"], () => this._txtWinValue.tweenAlpha = null);

        this._endShowBonus();
    }

    _hideWindow() {
        if (AppG.isWarning) return;
        // OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this._onKeyHandler, this);
        OMY.Omy.viewManager.pageGui.bonusUpdate();

        super._hideWindow();
    }
}
