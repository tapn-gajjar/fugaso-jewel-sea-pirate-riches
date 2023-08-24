import {GameConstBase} from "../../casino/tools/GameConstBase";
import {AppG} from "../../casino/AppG";

export class GameConst extends GameConstBase {
    constructor() {
        super();
    }

    get gameHaveIntro() {
        return this._data["gameHaveIntro"] && AppG.showIntro;
    }
}
