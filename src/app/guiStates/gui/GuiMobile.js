import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {BtnHome} from "../../../casino/display/buttons/BtnHome";
import {GameConstStatic} from "../../GameConstStatic";
import {GuiBase} from "../../../casino/gui/GuiBase";
import {BtnAudioMobile} from "../../../casino/display/buttons/desktop/settings/BtnAudioMobile";
import {BtnMenuWindow} from "../../../casino/display/buttons/mobile/BtnMenuWindow";
import {BtnBetWindow} from "../../../casino/display/buttons/mobile/BtnBetWindow";
import {BtnStartSkipMobile} from "../../../casino/display/buttons/mobile/BtnStartSkipMobile";

export class GuiMobile extends GuiBase {
    constructor() {
        super();
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

        this._createButtons();
        this._createTexts();

        super._createGraphic();
        this._updateGameSize();
    }

    _updateGameSize() {
        super._updateGameSize();

        this.getChildByName("s_bar_side2").width = this.getChildByName("s_bar_side2").saveW + AppG.dx;
        this.getChildByName("s_bar_side1").width = this.getChildByName("s_bar_side1").saveW + AppG.dx;

        this.getChildByName("s_panel_header").width = OMY.Omy.WIDTH;
        this.getChildByName("s_buttom").width = OMY.Omy.WIDTH;
    }

    /**     * @public     */
    _createTexts() {
        super._createTexts();
        /** @type {OMY.OContainer} */
        let container;
        container = this.getChildByName("t_one_bet");
        /** @type {OMY.OTextNumberBitmap} */
        this._txtOneBet = container.canvas.getChildByName("t_value");
        this._txtOneBet.lastText = AppG.currency;
        this._txtOneBet.showCent = true;
        this._txtOneBet.addTextUpdate(container.alignContainer, container);
        container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);
        container = this.getChildByName("t_line");
        /** @type {OMY.OTextNumberBitmap} */
        this._txtLines = container.canvas.getChildByName("t_value");
        this._txtLines.showCent = false;
        this._txtLines.addTextUpdate(container.alignContainer, container);
        container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);

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
            new BtnStartSkipMobile(this.getChildByName("b_stop"));
        else
            this.getChildByName("b_stop").destroy();
        new BtnMenuWindow(this.getChildByName("b_menu"));
        new BtnBetWindow(this.getChildByName("b_bet"));
        new BtnHome(this.getChildByName("b_home"));
        new BtnAudioMobile(this.getChildByName("b_audio"));
    }

    updateBalance() {
        super.updateBalance();
    }

    updateBet() {
        super.updateBet();
        this._txtOneBet.setNumbers(AppG.serverWork.currBet);
        this._txtLines.setNumbers(AppG.serverWork.currLines);
    }

    _updateOnWin(value, skip = false) {
        if (AppG.winCredit !== 0 && AppG.isRespin && skip)
            value = AppG.totalWinInSpin;
        if (AppG.winCredit !== 0 && OMY.Omy.sound.isSoundPlay(GameConstStatic.S_take_end)) OMY.Omy.sound.stop(GameConstStatic.S_take_end);
        super._updateOnWin(value, skip);
    }

    /** @private */
    _onCreateWindow(wName) {
        switch (wName) {
            case AppConst.W_BONUS: {
                // this._panelWin.visible = false;
                // this._textWin.visible = false;
                // this.getChildByName("c_win_block").visible = false;
                // this.getChildByName("t_win_tittle").visible = false;
                // this.getChildByName("s_panel_win").visible = false;
                break;
            }
        }
    }

    /** @private */
    _onRemoveWindow(wName) {
        switch (wName) {
            case AppConst.W_BONUS: {
                // this._panelWin.visible = true;
                // this._textWin.visible = true;
                // this.getChildByName("c_win_block").visible = true;
                // this.getChildByName("t_win_tittle").visible = true;
                // this.getChildByName("s_panel_win").visible = true;
                break;
            }
        }
    }
}
