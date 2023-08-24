import {GameinfoPageBase} from "../../../../casino/gui/windows/menu/GameinfoPageBase";
import {AppG} from "../../../../casino/AppG";

export class GameinfoPage extends GameinfoPageBase {
    constructor(source) {
        super(source);
    }

    _onCheckGraphic() {
        super._onCheckGraphic();

        this._scatterLabel = this._cPageContent.getChildByName("s_pt_1_scatter_us-US");
        if (this._scatterLabel) {
            OMY.Omy.loc.addUpdate(this._onLocChange, this);
            this._onLocChange();
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

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    destroy() {
        if (this._scatterLabel) {
            OMY.Omy.loc.removeUpdate(this._onLocChange, this);
            this._scatterLabel = null;
        }
        super.destroy();
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------
}
