import {AppConst} from "../../../casino/AppConst";
import {InfoLine} from "../../display/InfoLine";
import {BtnPayTable} from "../../../casino/display/buttons/desktop/BtnPayTable";
import {BtnFullscreen} from "../../../casino/display/buttons/desktop/settings/BtnFullscreen";
import {BtnAudio} from "../../../casino/display/buttons/desktop/settings/BtnAudio";
import {GuiBase} from "../../../casino/gui/GuiBase";
import {AppG} from "../../../casino/AppG";
import {BtnBetUp} from "../../../casino/display/buttons/desktop/BtnBetUp";
import {BtnBetDown} from "../../../casino/display/buttons/desktop/BtnBetDown";
import {BtnMenuDesktop} from "../../../casino/display/buttons/desktop/settings/BtnMenuDesktop";
import {BtnTurbo} from "../../../casino/display/buttons/desktop/settings/BtnTurbo";
import {BtnHome} from "../../../casino/display/buttons/BtnHome";
import {BtnLocalization} from "../../../casino/display/buttons/desktop/settings/BtnLocalization";
import {BtnHistory} from "../../../casino/display/buttons/desktop/settings/BtnHistory";
import {BtnStartSkip} from "../../../casino/display/buttons/desktop/BtnStartSkip";
import {AutoBlockSetting} from "../../../casino/display/gui/AutoBlockSetting";
import {GameConstStatic} from "../../GameConstStatic";

export class GuiDesktop extends GuiBase {
    constructor() {
        super();
    }

    _updateGameSize() {
        super._updateGameSize();
        this.getChildByName("s_bar_side2").width = this.getChildByName("s_bar_side2").saveW + AppG.dx;
        this.getChildByName("s_bar_side1").width = this.getChildByName("s_bar_side1").saveW + AppG.dx;
    }

    _createGraphic() {
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDGui");
        if (this._gdConf["entities"]) {
            for (let i = 0; i < this._gdConf["entities"].length; i++) {
                let conf = this._gdConf["entities"][i];
                if (!AppG.isHaveJackpot && conf.hasOwnProperty("jpContent")
                    && conf["jpContent"] === true) conf["active"] = false;
            }
        }
        OMY.Omy.add.createEntities(this, this._gdConf);

        this.getChildByName("s_bar_side1").saveW = this.getChildByName("s_bar_side1").width;
        this.getChildByName("s_bar_side2").saveW = this.getChildByName("s_bar_side2").width;

        this._createTexts();
        this._createButtons();

        super._createGraphic();
        this._updateGameSize();
    }

    /**     * @public     */
    _createTexts() {
        super._createTexts();
        /** @type {OMY.OContainer} */
        let container;
        container = this.getChildByName("t_bet_2");
        /** @type {OMY.OTextNumberBitmap} */
        this._txtBet2 = container.canvas.getChildByName("t_value");
        this._txtBet2.lastText = AppG.currency;
        this._txtBet2.showCent = true;
        this._txtBet2.addTextUpdate(container.alignContainer, container);
        container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);
        /** @type {OMY.OTextNumberBitmap} */
        this._txtOneBet = this.getChildByName("t_one_bet");
        this._txtOneBet.lastText = AppG.currency;
        this._txtOneBet.showCent = true;
        /** @type {OMY.OTextNumberBitmap} */
        this._txtLines = this.getChildByName("t_line");
        this._txtLines.showCent = false;

        // this._infoLine = new InfoLine(this.getChildByName("info_line"), this._txtBalance);

        this.updateWin();
        this.updateBalance();
        this.updateBet();
        if (AppG.isBeginRespin)
            this._txtWin.setNumbers(AppG.totalRespinWin);
    }

    /**     * @public     */
    _createButtons() {
        super._createButtons();

        if (AppG.isHaveSkip)
            new BtnStartSkip(this.getChildByName("b_stop"));
        else
            this.getChildByName("b_stop").destroy();
        new BtnBetUp(this.getChildByName("b_bet_up"));
        new BtnBetDown(this.getChildByName("b_bet_down"));

        this._btnMenu = new BtnMenuDesktop(this.getChildByName("b_menu"));
        AppG.emit.on(AppConst.APP_MENU_DESK_TOGGLE, this._toggleMenu, this);
        this._dropMenuList = [];
        this._hitMenuArea = this.getChildByName("r_hint_menu");

        this._dropMenuList.push(new BtnPayTable(this.getChildByName("b_pay")));
        this.getChildByName("b_turbo") && this._dropMenuList.push(new BtnTurbo(this.getChildByName("b_turbo")));
        this._dropMenuList.push(new BtnLocalization(this.getChildByName("b_loc")));
        this._dropMenuList.push(new BtnHistory(this.getChildByName("b_history")));

        if (AppG.isNeedHome) this._dropMenuList.push(new BtnHome(this.getChildByName("b_home")));
        else
            this.removeChild(this.getChildByName("b_home"));

        this._toggleMenu(false);

        new BtnFullscreen(this.getChildByName("b_fullscreen"));
        new BtnAudio(this.getChildByName("b_audio"));

        this._autoBlock = new AutoBlockSetting(this.getChildByName("c_auto_game"));
    }

    updateBet() {
        super.updateBet();
        this._txtBet2.setNumbers(AppG.serverWork.totalBet);
        this._txtOneBet.setNumbers(AppG.serverWork.currBet);
        this._txtLines.setNumbers(AppG.serverWork.currLines);
    }

    _updateOnWin(value, skip = false) {
        if (AppG.winCredit !== 0 && AppG.isRespin && skip)
            value = AppG.totalWinInSpin;
        if (AppG.winCredit !== 0 && OMY.Omy.sound.isSoundPlay(GameConstStatic.S_take_end)) OMY.Omy.sound.stop(GameConstStatic.S_take_end);
        super._updateOnWin(value, skip);
    }

    /**     * @private     */
    _toggleMenu(state) {
        this._hitMenuArea.input = !state;
        const btnAlpha = (state) ? 1 : 0;
        this._dropMenuList.map((a, index, array) => {
            array[index].graphic.alpha = btnAlpha;
        });
    }

    /** @private */
    _onCreateWindow(wName) {
        switch (wName) {
            case AppConst.W_BONUS: {
                // this._panelBet.visible = false;
                // this._panelWin.visible = false;
                // this._textWin.visible = false;
                // this._txtBalance.alpha = 0;
                // this.getChildByName("t_curr").visible = false;
                // this.getChildByName("t_label_balance").visible = false;
                // this.getChildByName("s_balance_field").visible = false;
                // this.getChildByName("c_win_block").visible = false;
                // this.getChildByName("t_win_tittle").visible = false;
                // this.getChildByName("s_panel_win").visible = false;
                break;
            }
            case AppConst.W_PAY: {
                // this._panelWin.visible = false;
                // this._textWin.visible = false;
                // this._txtBalance.alpha = 0;
                // this.getChildByName("t_curr").visible = false;
                // this.getChildByName("t_label_balance").visible = false;
                // this.getChildByName("s_balance_field").visible = false;
                // this.getChildByName("c_win_block").visible = false;
                // this.getChildByName("t_win_tittle").visible = false;
                // this.getChildByName("s_panel_win").visible = false;
                break;
            }
            case AppConst.W_FREE_IN_FREE: {
                // this._txtTotalFreeSpins.text = this._totalFreeGame - AppG.serverWork.countFreeGame;
                break;
            }
        }
    }

    /** @private */
    _onRemoveWindow(wName) {
        switch (wName) {
            case AppConst.W_BONUS: {
                // this._panelBet.visible = true;
                // this._panelWin.visible = true;
                // this._textWin.visible = true;
                // this._txtBalance.alpha = 1;
                // this.getChildByName("t_curr").visible = true;
                // this.getChildByName("t_label_balance").visible = true;
                // this.getChildByName("s_balance_field").visible = true;
                // this.getChildByName("c_win_block").visible = true;
                // this.getChildByName("t_win_tittle").visible = true;
                // this.getChildByName("s_panel_win").visible = true;
                break;
            }
            case AppConst.W_PAY: {
                // this._panelWin.visible = true;
                // this._textWin.visible = true;
                // this._txtBalance.alpha = 1;
                // this.getChildByName("t_curr").visible = true;
                // this.getChildByName("t_label_balance").visible = true;
                // this.getChildByName("s_balance_field").visible = true;
                // this.getChildByName("c_win_block").visible = true;
                // this.getChildByName("t_win_tittle").visible = true;
                // this.getChildByName("s_panel_win").visible = true;
                break;
            }
        }
    }

    /**     * @private     */
    hideBonusMes() {
    }
}
