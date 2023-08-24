import {GameConstStatic} from "../../GameConstStatic";
import {Background} from "../../display/Background";
import {MainViewBase} from "../../../casino/gui/pages/MainViewBase";
import {LineInGame} from "../../display/LineInGame";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

export class MainView extends MainViewBase {
    constructor() {
        super();
        /** @type {ReelBlock} */
        this._reelBlock = null;
        AppG.emit.on(AppConst.APP_HIDE_WIN_EFFECT, this._cleanWinEffect, this);
        // AppG.emit.on(AppConst.APP_WAIT_REEL, this._stopWaitSymbolReel, this);
    }

    revive() {
        this._bgGraphic = this.getChildByName("c_game_bg");
        this._reelGraphic = this.getChildByName("reels").getChildByName("reel_canvas");

        /** @type {OMY.OContainer} */
        this._wildsCanvas = this.getChildByName("reels").getChildByName("c_wilds");

        super.revive();

        if (AppG.gameConst.gameHaveIntro) {
            OMY.Omy.viewManager.showWindow(AppConst.W_INTRO, true,
                OMY.Omy.viewManager.gameUI.getWindowLayer("c_intro_layer"));
        } else {
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            OMY.Omy.sound.pauseAll();
            OMY.Omy.sound.resumeAll();
            OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        }
    }

    _createGraphic() {
        this.bg = new Background(this._bgGraphic);
        super._createGraphic();

        /** @type {LineInGameParticle} */
        this._lineInGame = new LineInGame(this.getChildByName("c_numbers"), this._reelBlock.activeList);
        this._lineInGame.linesGraphic = this.getChildByName("c_lines");
        // this._lineInGame.hide();

        /** @type {OMY.OContainer} */
        this._reelWaitCanvas = this.getChildByName("reels").getChildByName("c_effects");
        this._reelWaitCanvas.setAll("visible", false);
        this._isWaitEffect = false;

        /** @type {OMY.OContainer} */
        this._reelCoinsCanvas = this.getChildByName("reels").getChildByName("c_coins");
        for (let i = 0; i < this._reelCoinsCanvas.children.length; i++) {
            let actor = this._reelCoinsCanvas.children[i];
            actor.visible = false;
            actor.addComplete(this._clearCoinsMatrix, this, false);
            actor.userData = 1 + i;
        }
        this._isCoinsEffect = false;
        this._isCoinsMatrix = [0, 0, 0, 0, 0];
        AppG.emit.on(GameConstStatic.SYMBOL_ON_REEL, this._wildOnScreen, this);

        /* /!** @type {OMY.OContainer} *!/
         this._freeInFreeMess = this.getChildByName("c_free_in_free").getChildByName("c_free_info");
         this._freeInFreeMess.visible = false;
         if (this._freeInFreeMess.json.test)
             OMY.Omy.add.timer(this._freeInFreeMess.json.test,
                 this.freeInFree, this);*/

        AppG.emit.on(AppConst.APP_SHOW_BIG_WIN, this._onShowBigWin, this);
        AppG.emit.on(AppConst.APP_HIDE_MESSAGE_WIN, this._onHideBigWin, this);
        this._saveMatrixHolds = null;
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        super._updateGameSize(dx, dy, isScreenPortrait);
    }

    // region spin:
    //-------------------------------------------------------------------------
    sendSpin() {
        if (AppG.isRespin)
            OMY.Omy.sound.play(GameConstStatic.S_reel_respin_bg);
        else
            OMY.Omy.sound.play(GameConstStatic.S_reel_bg, true);
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_intro))
            OMY.Omy.sound.stop(GameConstStatic.S_intro);
        this._isCoinsMatrix.map((a, index, array) => array[index] = 0);
        this._activeWaitReelIndex = -1;

        super.sendSpin();
    }

    onSendSpin() {
        if ((AppG.isBeginRespin || AppG.isRespin) && !AppG.skipped) {
            this._longEffect = [0, 0, 0, 0, 0];
            let countWild = 0;
            let isLong = false;
            for (let i = 1; i < AppG.serverWork.newHoldReel.length; i++) {
                if (!isLong && Boolean(AppG.serverWork.newHoldReel[i])) {
                    isLong = true;
                    continue;
                }
                if (isLong && !this._reelBlock.getReel(i).isBlock) {
                    this._longEffect[i] = 1;
                    if (i < AppG.serverWork.newHoldReel.length - 1)
                        countWild += 1;
                }
            }
            if (countWild > 0) {
                this._needOnWildWait = true;
                this._reelBlock.respinLongEffect(this._longEffect);
            }
        }
        super.onSendSpin();
    }

    skipSpin() {
        // this._clearWaitEffect();
        if (AppG.isMoveReels) {
            this._needOnWildWait = false;
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_bg)) {
                OMY.Omy.sound.stop(GameConstStatic.S_reel_bg);
            }
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_respin_bg)) {
                OMY.Omy.sound.stop(GameConstStatic.S_reel_respin_bg);
            }
        }
        super.skipSpin();
    }

    _spinEnd() {
        super._spinEnd();
        this._clearWaitEffect();
        this._clearCoinsEffect();
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_wait))
            OMY.Omy.sound.stop(GameConstStatic.S_wild_wait);

        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_bg)) {
            OMY.Omy.sound.stop(GameConstStatic.S_reel_bg);
        }
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_respin_bg)) {
            OMY.Omy.sound.stop(GameConstStatic.S_reel_respin_bg);
        }
    }

    _onReelStops(reelId) {
        super._onReelStops(reelId);
        if (AppG.isBeginRespin || AppG.isRespin) {
            /*if (Boolean(AppG.serverWork.newHoldReel[reelId])) {
                for (let j = 0; j < this._activeList[reelId].length; j++) {
                    if (this._activeList[reelId][j].symbolName === "A") {
                        this._activeList[reelId][j].playWildWaitEffect();
                        break;
                    }
                }
            }*/
            if (this._needOnWildWait && this._reelBlock.getReel(reelId).effectIndex !== -1) {
                this._stopWaitSymbolReel(this._reelBlock.getReel(reelId).effectIndex);
            }
        }
        // if (this._isCoinsEffect) {
        //     if (Boolean(this._isCoinsMatrix[reelId])) {
        //         this._isCoinsMatrix[reelId] = 0;
        //         /** @type {OMY.OActorSpine} */
        //         let actor = this._reelCoinsCanvas.getChildByName("reel_" + String(reelId));
        //         actor.visible = false;
        //         actor.stop();
        //     }
        // }
    }

    /**     * @private     */
    _onReelEaseStops(reelId) {
        super._onReelEaseStops(reelId);
        this._checkCoinsEffect();
        if (AppG.isBeginRespin || AppG.isRespin) {
            if (Boolean(AppG.serverWork.newHoldReel[reelId])) {
                for (let j = 0; j < this._activeList[reelId].length; j++) {
                    if (this._activeList[reelId][j].symbolName === "A") {
                        this._activeList[reelId][j].playWildWaitEffect();
                        break;
                    }
                }
            }
        }
    }

//-------------------------------------------------------------------------
    //endregion

    // region scatter wait:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _stopWaitSymbolReel(reelId, waitSymbol) {
        if (!this._isWaitEffect) {
            this._isWaitEffect = true;
            /*for (let i = 0; i < reelId; i++) {
                for (let j = 0; j < this._reelBlock.activeList[i].length; j++) {
                    this._reelBlock.activeList[i][j].holdSymbol();
                }
            }*/
        } /*else {
             for (let j = 0; j < this._reelBlock.activeList[reelId - 1].length; j++) {
                 this._reelBlock.activeList[reelId - 1][j].holdSymbol();
             }
         }*/
        this._offWaitEffect();
        this._onWaitEffect(reelId);

    }

    /**     * @private     */
    _offWaitEffect() {
        if (this._activeWaitEffect) {
            OMY.Omy.remove.tween(this._activeWaitEffect);
            OMY.Omy.add.tween(this._activeWaitEffect, {alpha: 0, onCompleteParams: [this._activeWaitEffect]},
                this._reelWaitCanvas.json["alpha_time"], (spine) => {
                    spine.stop();
                    spine.visible = false;
                });
            this._activeWaitEffect = null;
        }
    }

    /**     * @private     */
    _onWaitEffect(reelId) {
        if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_wait))
            OMY.Omy.sound.play(GameConstStatic.S_wild_wait, true);
        this._activeWaitReelIndex = reelId;
        this._reelBlock._reelList[reelId].stopMoveSpeed();
        this._activeWaitEffect = this._reelWaitCanvas.getChildByName("reel_" + String(reelId));
        OMY.Omy.remove.tween(this._activeWaitEffect);
        this._activeWaitEffect.visible = true;
        this._activeWaitEffect.alpha = 0;
        this._activeWaitEffect.gotoAndPlay(0, true);
        OMY.Omy.add.tween(this._activeWaitEffect, {alpha: 1},
            this._reelWaitCanvas.json["alpha_time"]);
    }

    /**     * @private     */
    _clearWaitEffect() {
        if (this._isWaitEffect) {
            OMY.Omy.sound.stop(GameConstStatic.S_scatter_wait);
            for (let i = 0; i < this._reelBlock.activeList.length; i++) {
                for (let j = 0; j < this._reelBlock.activeList[i].length; j++) {
                    this._reelBlock.activeList[i][j].unHoldSymbol();
                }
            }
            this._isWaitEffect = false;
            this._needOnWildWait = false;
            this._activeWaitReelIndex = -1;
            this._offWaitEffect();
        }
    }

    //-------------------------------------------------------------------------
    //endregion
    // region :wild on screen
    //-------------------------------------------------------------------------
    /**     * @private     */
    _wildOnScreen(reelIndex) {
        if (reelIndex > 0 && reelIndex < 4) {
            if (!this._isCoinsEffect) {
                this._isCoinsEffect = true;
            }
            const activeReel = reelIndex === this._activeWaitReelIndex;
            if (!Boolean(this._isCoinsMatrix[reelIndex])) {
                this._isCoinsMatrix[reelIndex] = 1;
                /** @type {OMY.OActorSpine} */
                let actor = this._reelCoinsCanvas.getChildByName("reel_" + String(reelIndex));
                actor.visible = true;
                actor.alpha = 1;
                let animate = (activeReel) ? actor.json["bonus_anim"] : actor.json["custom_a_name"];
                actor.gotoAndPlay(0, false, animate);
                if (!activeReel)
                    OMY.Omy.sound.play(GameConstStatic.S_fly_coins);
            } else if (!activeReel) {
                let actor = this._reelCoinsCanvas.getChildByName("reel_" + String(reelIndex));
                actor.gotoAndPlay(0, false);
                OMY.Omy.sound.play(GameConstStatic.S_fly_coins);
            }
        }
    }

    /**     * @private     */
    _clearCoinsMatrix(actor) {
        this._isCoinsMatrix[actor.userData] = 0;
        actor.stop();
        actor.visible = false;
    }

    /**     * @private     */
    _clearCoinsEffect() {
        if (this._isCoinsEffect) {
            OMY.Omy.sound.stop(GameConstStatic.S_fly_coins);
            this._isCoinsEffect = false;
            // this._reelWaitCanvas.callAll("stop");
            // this._reelWaitCanvas.setAll("visible", false);

        }
    }

    /**     * @private     */
    _checkCoinsEffect() {
        if (this._isCoinsEffect) {
            for (let i = 0; i < this._isCoinsMatrix.length; i++) {
                if (Boolean(this._isCoinsMatrix[i])) {
                    let actor = this._reelCoinsCanvas.getChildByName("reel_" + String(i));
                    // actor.stop();
                    OMY.Omy.add.tween(actor, {alpha: 0}, 0.2, this._clearCoinsMatrix.bind(this),
                        {
                            onCompleteParams: [actor],
                        });
                }
            }
        }
    }

    //-------------------------------------------------------------------------
    //endregion
    // region BONUS GAME: WHEEL
    //-------------------------------------------------------------------------

    _startBonusGame() {
        super._startBonusGame();
    }

    _continueShowBonus() {
        super._continueShowBonus();
    }

//-------------------------------------------------------------------------
    //endregion

    // region FREE GAME
    //-------------------------------------------------------------------------

    startFreeGame() {
        super.startFreeGame();

        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        GameConstStatic.S_game_bg = GameConstStatic.S_bg_fg;
    }

    _continueStartFree() {
        if (AppG.serverWork.haveFreeOnStart) {
            super._continueStartFree();
        } else {
            OMY.Omy.sound.play(GameConstStatic.S_scatter_join);
            this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
            this._activeList.map((a, index, array) => a.map((b, index, array) => b.scatterFree()));
            OMY.Omy.add.timer(this._gdConf["timer_start_free"], this._showFreeWindow, this);
        }
    }

    /**     * @private     */
    _showFreeWindow() {
        OMY.Omy.sound.stop(GameConstStatic.S_scatter_join);
        OMY.Omy.add.timer(1, () => {
            this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
        }, this);
        super._continueStartFree();
    }

    finishFreeGame() {
        super.finishFreeGame();
    }

    _continueEndFree() {
        super._continueEndFree();
    }

    freeInFree() {
        /*this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
        this._activeList.map((a, index, array) => a.map((b, index, array) => b.scatterFree(true)));
        OMY.Omy.add.timer(this._gdConf["timer_start_free"], this._showFreeInFreeWindow, this);*/
    }

    /*/!**     * @private     *!/
    _showFreeInFreeWindow() {
        this._freeInFreeMess.visible = true;
        this._freeInFreeMess.alignContainer();
        this._freeInFreeMess.alpha = 0;
        this._freeInFreeMess.scale.set(0);
        OMY.Omy.sound.play(GameConstStatic.S_fg_in_free);
        this._freeInFreeMess.setXY(this._freeInFreeMess.json.x, this._freeInFreeMess.json.y);
        OMY.Omy.add.tween(this._freeInFreeMess, {
            scaleX: 1, scaleY: 1, alpha: 1, ease: this._freeInFreeMess.json["ease_show"],
        }, this._freeInFreeMess.json["tween_show"], this._inFreeDelay.bind(this));
    }

    /!**     * @private     *!/
    _inFreeDelay() {
        OMY.Omy.add.timer(this._freeInFreeMess.json["delay_screen"], this._hideInFreeMess, this);
    }

    /!**     * @private     *!/
    _hideInFreeMess() {
        const hidePos = this._freeInFreeMess.json["tween_hide_pos"];
        OMY.Omy.add.tween(this._freeInFreeMess, {
            scaleX: 0, scaleY: 0, alpha: 0, ease: this._freeInFreeMess.json["ease_hide"],
            x: hidePos.x, y: hidePos.y,
        }, this._freeInFreeMess.json["tween_hide"], this._onInFreeMessHide.bind(this));
    }

    /!**     * @private     *!/
    _onInFreeMessHide() {
        this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
        AppG.serverWork.updateTotalFreeGame();
        AppG.state.gameOver();
    }*/

//-------------------------------------------------------------------------
    //endregion

    // region Re-Spin:
    //-------------------------------------------------------------------------

    startRespinGame(onStart = false) {
        if (AppG.isBeginRespin) {
            super.startRespinGame(onStart);
            // OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
            // GameConstStatic.S_game_bg = GameConstStatic.S_bg_rs;
            // OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        }

        this.changeReelForWild();
        if (onStart) {
            OMY.Omy.add.timer(2.5, AppG.state.startNewSession, AppG.state);
        } else {
            OMY.Omy.add.timer(2.5, AppG.state.continueGameOver, AppG.state);
        }
        return true;
    }

    changeReelForWild() {
        let holds = AppG.serverWork.newHoldReel;
        for (let i = 0; i < holds.length; i++) {
            if (holds[i] === 1) this._playReelChangeEffect(i);
        }
        OMY.Omy.sound.play(GameConstStatic.S_respin_open);
        OMY.Omy.add.timer(2.4, this._synchAnimations, this);
    }

    /**     * @private     */
    _synchAnimations() {
        for (let i = 0; i < this._wildsCanvas.children.length; i++) {
            this._wildsCanvas.children[i].gotoAndPlay(0, true);
        }
    }

    /**     * @private     */
    _playReelChangeEffect(i) {
        this._reelBlock.blockReel(i);
        let startPoint = null;
        let countWild = 0;
        for (let j = 0; j < this._activeList[i].length; j++) {
            if (this._activeList[i][j].symbolName === "A") {
                countWild++;
                if (!startPoint)
                    startPoint = this._wildsCanvas.toLocal(this._activeList[i][j].getGlobalPosition());
            }
        }
        for (let j = 0; j < this._activeList[i].length; j++) {
            const spine = OMY.Omy.add.actorJson(this._wildsCanvas, this._wildsCanvas.json["wild"]);
            spine.name = String(i) + "_" + String(j);
            if (countWild === 3) {
                let point = this._wildsCanvas.toLocal(this._activeList[i][j].getGlobalPosition());
                spine.setXY(point.x, point.y);
            } else {
                spine.setXY(startPoint.x, startPoint.y);
            }
            spine.gotoAndPlay(0, true);
            if (this._activeList[i][j].symbolName === "A") {
                this._activeList[i][j].respinSymbol(spine);
                // spine.gotoAndPlay(0, false, spine.json["a_win"]);
            } else {
                // spine.gotoAndPlay(0, false);
                /** @type {SlotSymbolBase} */
                const symbol = this._activeList[i][j];
                const point = this._wildsCanvas.toLocal(symbol.getGlobalPosition());
                OMY.Omy.add.tween(spine, {x: point.x, y: point.y}, 0.5, this._changeSymbol2Respin.bind(this),
                    {
                        delay: 0.9,
                        ease: "slow(0.7, 0.7, false)",
                        onCompleteParams: [spine, symbol],
                    });

            }
        }
    }

    /**
     *  * @private
     * @param {OMY.OActorSpine}spine
     * @param {SlotSymbol}symbol
     * @private
     */
    _changeSymbol2Respin(spine, symbol) {
        symbol.setSymbol("A");
        symbol.respinSymbol(spine);
    }

    finishRespinGame(onWin = false) {
        if (AppG.isEndRespin) {
            // OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
            // GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            // OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            OMY.Omy.sound.play(GameConstStatic.S_respin_close);
            this._saveMatrixHolds = null;
            super.finishRespinGame();
            this._reelBlock.unBlockReels();
            this._wildsCanvas.callAll("stop");
            this._wildsCanvas.callAll("kill");
            for (let i = 0; i < this._activeList.length; i++) {
                for (let j = 0; j < this._activeList[i].length; j++) {
                    this._activeList[i][j].unRespinSymbol();
                }
            }

            if (!onWin) {
                if (AppG.serverWork.nextActionTake) {
                    AppG.state.collectWin();
                    return true;
                }
            }
        }
        return false;
    }

//-------------------------------------------------------------------------
    //endregion

    showWinCombo() {
        if (AppG.winCoef > 100) OMY.Omy.sound.play(GameConstStatic.S_show_win_5);
        else if (AppG.winCoef > 30) OMY.Omy.sound.play(GameConstStatic.S_show_win_4);
        else if (AppG.winCoef > 10) OMY.Omy.sound.play(GameConstStatic.S_show_win_3);
        if(AppG.isSuperTurbo){
            this._showWinTurbo();
            return;
        }
        super.showWinCombo();
    }

    _showWinTurbo() {
        super._showWinTurbo();
    }

    _showAllWinLinesTurbo() {
        OMY.Omy.info('view. start show all win line turbo');
        this._dataWin.repeatWins();
        this._winEffect.show();

        this._resetArrayWinData();
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();
            let allowArray = this.findWinSymbols(this._dataWin, false, false, this._showOnWinNoWinSymbols);
            this._winEffect.showWinSymbol(allowArray, this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter);
            for (let i = 0; i < allowArray.length; i++) {
                let index = AppG.convertID(allowArray[i].reelId, allowArray[i].symbolId);
                if (this._arrayWinData[index].type !== AppConst.SLOT_SYMBOL_WIN && allowArray[i].type === AppConst.SLOT_SYMBOL_WIN) {
                    AppG.setWinSymbolD(this._arrayWinData[index]);
                    this._arrayWinData[index] = allowArray[i];
                }
            }
            if (!this._dataWin.isScatter)
                this._lineInGame.showWinLine(this._dataWin.line, false, false, false, this._dataWin.countSymbol);
            this._animateWinLine();
        }
        this._reelBlock.updateWinState(this._arrayWinData);

        this._dataWin.repeatWins();
    }

    _checkWinMessageTurbo() {
        OMY.Omy.info('view. win coef in turbo:', AppG.winCoef);
        if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate")) {
            if (AppG.winCoef >= AppG.gameConst.getData("super_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_SUPER_MEGA_WIN_TURBO, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("mega_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_MEGA_WIN_TURBO, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN_TURBO, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN_TURBO, AppG.winCredit);
            }/* else {
                AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN_TURBO, AppG.winCredit);
            }*/
        } else {
            AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN_TURBO, AppG.winCredit);
        }
    }

    _animateLoopLine() {
        super._animateLoopLine();
        /*switch (this._dataWin.countSymbol) {
            case 5: {
                OMY.Omy.sound.play(GameConstStatic.S_win_5());
                break;
            }
            case 4: {
                OMY.Omy.sound.play(GameConstStatic.S_win_4());
                break;
            }

            default: {
                OMY.Omy.sound.play(GameConstStatic.S_win_3());
                break;
            }
        }*/
    }

    _animateWinLine() {
        super._animateWinLine();

        /*if (!this._isAnimationsSkiped || this._dataWin.isBonusWin || this._dataWin.isScatter) {
            if (this._winSymbolSound)
                OMY.Omy.sound.stop(this._winSymbolSound);
            this._winSymbolSound = null;
            switch (this._dataWin.winSymbol) {
                default: {
                    this._winSymbolSound = GameConstStatic["S_symbol_" + String(this._dataWin.winSymbol)];
                    break;
                }
            }
            OMY.Omy.sound.play(this._winSymbolSound);
        }*/
    }

    _skipWinAnimations() {
        super._skipWinAnimations();
    }

    _endShowWinLines() {
        super._endShowWinLines();
    }

    _settingNextLineTime() {
        // if (AppG.isAutoGame) {
        //     return AppG.incTimeTake / this._dataWin.countLinesWin;
        // } else {
        return super._settingNextLineTime();
        // }
    }

    startLoopAnimation() {
        if ((AppG.isAutoGame && !AppG.isEndRespin) || AppG.isFreeGame) return;
        if (AppG.isEndRespin)
            this.finishRespinGame(true);

        this._lineTimer?.destroy();
        if (this._dataWin.countLinesWin !== 1) {
            if (!this._playLoopAnimations) {
                super.startLoopAnimation();
            } else {
                if (this._gdConf["wait_delay_loop"]) {
                    this._lineInGame.hideWinEffect();
                    this._winEffect.hide();
                    this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
                    this._delayLoopTimer = OMY.Omy.add.timer(this._gdConf["wait_delay_loop"], this._onWaitDelayLoop, this);
                } else {
                    super.startLoopAnimation();
                }
            }
        } else {
            if (!this._playLoopAnimations)
                super.startLoopAnimation();
        }
    }

    findWinSymbols(dataWin, playSound = true, dispatch = true, noWin = false) {
        dispatch = this._playLoopAnimations;
        return super.findWinSymbols(dataWin, playSound, dispatch, noWin);
    }

    hideWin() {
        this._delayLoopTimer?.destroy();
        return super.hideWin();
    }

    /**     * @private     */
    _onWaitDelayLoop() {
        this._delayLoopTimer = null;
        super.startLoopAnimation();
    }

    /**     * @private     */
    _cleanWinEffect() {

    }

    _onPayWindowOpen() {
        super._onPayWindowOpen();
        this.getChildByName("reels").alpha = 0;
        this.getChildByName("c_numbers").alpha = 0;
        this.getChildByName("c_lines").alpha = 0;
        this.getChildByName("c_logo").alpha = 0;
    }

    _onPayWindowClose() {
        super._onPayWindowClose();
        this.getChildByName("reels").alpha = 1;
        this.getChildByName("c_numbers").alpha = 1;
        this.getChildByName("c_lines").alpha = 1;
        this.getChildByName("c_logo").alpha = 1;
    }

    _onIntroWindowClose() {
        OMY.Omy.sound.pauseAll();
        OMY.Omy.sound.resumeAll();
        if (!AppG.beginFreeGame && !AppG.isFreeGame) {
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        }
        super._onIntroWindowClose();
    }

    /**     * @private     */
    _onShowBigWin() {
    }

    /**     * @private     */
    _onHideBigWin() {
    }

    get activeWaitReelIndex() {
        return this._activeWaitReelIndex;
    }
}
