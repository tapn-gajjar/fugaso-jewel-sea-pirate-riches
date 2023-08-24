import {PaytablePageBase} from "../../../../casino/gui/windows/paytable/PaytablePageBase";
import {AppG} from "../../../../casino/AppG";

export class PaytablePage extends PaytablePageBase {
    constructor(gd) {
        super(gd);

        /** @type {OMY.OContainer} */
        this._rtpCanvas = this.getChildByName("c_canvas");
        if (this._rtpCanvas) {
            /** @type {OMY.OTextBitmap} */
            this._tRtp = this._rtpCanvas.canvas.getChildByName("t_rtp");
        }

        this._scatterLabel = this.getChildByName("s_pt_label");
        if (this._scatterLabel) {
            OMY.Omy.loc.addUpdate(this._onLocChange, this);
            this._onLocChange();
        }

        if (this.getChildByName("a_paytable_feature")) {
            /** @type {OMY.OActorSpine} */
            this._wildAnim = this.getChildByName("a_paytable_feature");
            this.removeChild(this._wildAnim);
            this._wildAnim.stop();
        }
    }

    /**     * @private     */
    _onLocChange() {
        if (this._scatterLabel) {
            for (let key in this._scatterLabel.json["loc"]) {
                if (OMY.OMath.inArray(this._scatterLabel.json["loc"][key], AppG.language)) {
                    this._scatterLabel.texture = key;
                    break;
                }
            }
        }
    }

    revive() {
        super.revive();
        if (this._rtpCanvas) {
            OMY.Omy.add.formatObjectsByY(this._rtpCanvas.canvas);
            this._rtpCanvas.alignContainer();
        }
        if (this._wildAnim) {
            this.addChild(this._wildAnim);
            this._wildAnim.gotoAndPlay(0, true);
        }
    }

    kill() {
        if (this._wildAnim?.parent) {
            this.removeChild(this._wildAnim);
            this._wildAnim.stop();
        }
        super.kill();
    }

    destroy(apt) {
        if (this._scatterLabel) {
            OMY.Omy.loc.removeUpdate(this._onLocChange, this);
            this._scatterLabel = null;
        }
        this._rtpCanvas = null;
        super.destroy(apt);
    }

    _updateBet() {
        super._updateBet();
    }
}
