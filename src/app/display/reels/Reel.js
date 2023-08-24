import {ReelBase} from "../../../casino/display/reels/ReelBase";
import {AppConst} from "../../../casino/AppConst";
import {AppG} from "../../../casino/AppG";

export class Reel extends ReelBase {
    constructor(conf, index, initCombination) {
        super(conf, index, initCombination);

        this._timeForLongReel = AppG.gameConst.getData("timeForLongReel");
        this._stoppingMoveSpeed = AppG.gameConst.getData("stoppingMoveSpeed");
    }

    stopMoveSpeed() {
        if (this.deaccelerationTween) {
            this.deaccelerationTween.kill();
            this.deaccelerationTween = null;
        }

        this.deaccelerationTween = OMY.Omy.add.tween(this,
            {speed: this.otherVector * this._stoppingMoveSpeed}, this._timeForLongReel);

    }
}
