import {LogoGameBase} from "../../casino/display/LogoGameBase";
import {AppG} from "../../casino/AppG";
import {AppConst} from "../../casino/AppConst";

export class LogoGame extends LogoGameBase {
    constructor(graphic) {
        super(graphic);

        AppG.emit.on(AppConst.EMIT_WIN, this._playWinEffect, this);
    }

    /**     * @private     */
    _playWinEffect() {
    }
}
