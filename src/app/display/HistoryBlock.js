import {HistoryBlockBase} from "../../casino/display/gui/HistoryBlockBase";
import {AppG} from "../../casino/AppG";

export class HistoryBlock extends HistoryBlockBase {
    constructor(soundBtn = null) {
        super(soundBtn);
    }

    /**
     * Draw win symbols at history view block
     * @param {HistoryActionData} data
     */
    _drawSymbols(data) {
        super._drawSymbols(data);
        if (data.mChange2Bonus && this._view.canvas.children.length) {
            let totalReel = AppG.totalReel;
            let countSlot = AppG.gameConst.countSlot;
            for (let i = 0; i < totalReel; i++) {
                let reelWithBonus = false;
                for (let j = 0; j < countSlot; j++) {
                    /** @type {OMY.OSprite} */
                    let symbol = this._view.canvas.getChildByName("s_" + String(i) + "_" + String(j));
                    if (symbol.userData === data.bonusSymbol) {
                        reelWithBonus = true;
                        break;
                    }
                }
                if (reelWithBonus) {
                    for (let j = 0; j < countSlot; j++) {
                        /** @type {OMY.OSprite} */
                        let symbol = this._view.canvas.getChildByName("s_" + String(i) + "_" + String(j));
                        let symbolIndex = AppG.gameConst.symbolID(data.bonusSymbol);
                        symbol.texture = this._gdConf["texture"] + String(symbolIndex);
                    }
                }
            }
            this._view.alignContainer();
        }
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------
}
