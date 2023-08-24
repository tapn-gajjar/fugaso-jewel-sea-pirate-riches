import {PaytableWindowBase} from "../../casino/gui/windows/PaytableWindowBase";
import {PaytablePage} from "./windows/paytable/PaytablePage";

export class PaytableWindow extends PaytableWindowBase {
    constructor() {
        super();
        this._pageClass = PaytablePage;
    }

    _createGraphic() {
        if (this._isGraphic) return;
        super._createGraphic();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        super._clearGraphic();
    }

    revive(onComplete = null) {
        super.revive(onComplete);
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
}
