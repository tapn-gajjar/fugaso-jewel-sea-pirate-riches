import {AppG} from "../casino/AppG";
import {AppConst} from "../casino/AppConst";
import {MainView} from "./guiStates/pages/MainView";
import {PaytableWindow} from "./guiStates/PaytableWindow";
import {GuiDesktop} from "./guiStates/gui/GuiDesktop";
import {GuiMobile} from "./guiStates/gui/GuiMobile";
import {SlotStateBase} from "../casino/SlotStateBase";
import {HistoryWindow} from "./guiStates/HistoryWindow";
import {LocalisationWindow} from "../casino/gui/windows/LocalisationWindow";
import {BetWindow} from "./guiStates/BetWindow";
import {MenuWindow} from "./guiStates/MenuWindow";
import {CalcWindow} from "../casino/gui/windows/CalcWindow";
import {WarningReality} from "../casino/gui/windows/WarningReality";

export class SlotState extends SlotStateBase {
    constructor() {
        super();
    }

    showGame() {
        OMY.Omy.assets.addChars2BitmapFont("t_history_font", AppG.currency,
            AppG.gameConst.getData("t_history_font_config"));

        if (OMY.Omy.isDesktop) {
            OMY.Omy.viewManager.addTopGui(new GuiDesktop());
        } else {
            OMY.Omy.viewManager.addTopGui(new GuiMobile());
        }

        /*@type {MainView} */
        this._mainView = new MainView();
        OMY.Omy.viewManager.regWO(this._mainView, AppConst.P_VIEW_MAIN);
        // if (!AppG.playingForFun)
        OMY.Omy.viewManager.regWO(new WarningReality(), AppConst.W_REALITY);

        // OMY.Omy.viewManager.regWO(new IntroWindow(), AppConst.W_INTRO);

        // OMY.Omy.viewManager.regWO(new BonusChoiceWindow(), AppConst.W_BONUS);
        // if (AppG.gameHaveFree) {
        //     OMY.Omy.viewManager.regWO(new FreeGameBeginWindow(), AppConst.W_FREE_GAME_BEGIN);
        //     OMY.Omy.viewManager.regWO(new FreeGameEndWindow(), AppConst.W_FREE_GAME_END);
        //     // OMY.Omy.viewManager.regWO(new FreeInFreeWindow(), AppConst.W_FREE_IN_FREE);
        // }
        if (OMY.Omy.isDesktop) {
            OMY.Omy.viewManager.regWO(new PaytableWindow(), AppConst.W_PAY);
            OMY.Omy.viewManager.regWO(new HistoryWindow(), AppConst.W_HISTORY);
            OMY.Omy.viewManager.regWO(new LocalisationWindow(), AppConst.W_LOCALISATION);
        } else {
            OMY.Omy.viewManager.regWO(new BetWindow(), AppConst.W_BET_SETTINGS);
            OMY.Omy.viewManager.regWO(new MenuWindow(), AppConst.W_MENU);
            OMY.Omy.viewManager.regWO(new CalcWindow(), AppConst.W_CALC);
        }

        super.showGame();
    }

    lose() {
        super.lose();
    }

    showAllWinCombo() {
        if (this._gameWithFree && AppG.beginFreeGame) this._mainView.hideWin();
        super.showAllWinCombo();
    }

    gameOver() {
        if (AppG.isMoreFreeGame) {
            this._mainView.freeInFree();
        } else {
            if (AppG.gameHaveRespin && (AppG.isBeginRespin || AppG.isRespin)) {
                let needChangeReel = false;
                for (let i = 0; i < AppG.serverWork.newHoldReel.length; i++) {
                    if (Boolean(AppG.serverWork.newHoldReel[i])) {
                        needChangeReel = true;
                        break;
                    }
                }
                if (needChangeReel) {
                    this._mainView.startRespinGame();
                    return;
                }
            }
            super.gameOver();
        }
    }
}
