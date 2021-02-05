/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */
import Easing from './Easing.js';
import Interpolation from './Interpolation.js';
import { Rabbit } from '../Core.js';
var TweenHistoryType;

(function (TweenHistoryType) {
  TweenHistoryType["to"] = "to";
  TweenHistoryType["by"] = "by";
  TweenHistoryType["onComplete"] = "onComplete";
})(TweenHistoryType || (TweenHistoryType = {}));

export class TweenSequence {
  static nextId() {
    return TweenSequence._nextId++;
  }

}
TweenSequence._nextId = 0;

let now = () => {
  return Rabbit.Instance.time;
};

export class Tween {
  get startTime() {
    return this._startTime;
  }

  get target() {
    return this._object;
  }

  // constructor(private _object: T, private _group: Group | false = mainGroup) {}
  constructor(_object) {
    this._object = _object;
    this._isPaused = false;
    this._pauseStart = 0;
    this._valuesStart = {};
    this._valuesEnd = {};
    this._valuesStartRepeat = {};
    this._duration = 1000;
    this._initialRepeat = 0;
    this._repeat = 0;
    this._repeatDelayTime = void 0;
    this._yoyo = false;
    this._isPlaying = false;
    this._reversed = false;
    this._delayTime = 0;
    this._startTime = 0;
    this._easingFunction = Easing.Linear.None;
    this._interpolationFunction = Interpolation.Linear;
    this._chainedTweens = [];
    this._onStartCallback = void 0;
    this._onStartCallbackFired = false;
    this._onUpdateCallback = void 0;
    this._onRepeatCallback = void 0;
    this._onCompleteCallback = void 0;
    this._onStopCallback = void 0;
    this._id = TweenSequence.nextId();
    this._isChainStopped = false;
    this._historys = [];
    this.isAddToRabbit = false;
    this._goToEnd = false;
  }

  getId() {
    return this._id;
  }

  isPlaying() {
    return this._isPlaying;
  }

  isPaused() {
    return this._isPaused;
  }

  to(properties, duration) {
    this._historys.push({
      type: TweenHistoryType.to,
      args: [properties, duration]
    });

    return this;
  }

  _to(properties, duration) {
    // TODO? restore this, then update the 07_dynamic_to example to set fox
    // tween's to on each update. That way the behavior is opt-in (there's
    // currently no opt-out).
    // for (const prop in properties) this._valuesEnd[prop] = properties[prop]
    this._valuesEnd = Object.create(properties);

    if (duration !== undefined) {
      this._duration = duration * 1000;
    }

    return this;
  }

  by(properties, duration) {
    this._historys.push({
      type: TweenHistoryType.by,
      args: [properties, duration]
    });

    return this;
  }

  _by(properties, duration) {
    this._valuesEnd = Object.create(properties);

    for (const str in properties) {
      this._valuesEnd[str] = this._object[str] + properties[str];
    }

    if (duration !== undefined) {
      this._duration = duration * 1000;
    }

    return this;
  }

  duration(d = 1000) {
    this._duration = d;
    return this;
  }

  start() {
    if (this._isPlaying) {
      return this;
    }

    this._valuesStart = {};
    this._valuesEnd = {};
    this._valuesStartRepeat = {};

    this._historys.forEach(item => {
      this["_" + item.type].apply(this, item.args);
    }); // eslint-disable-next-line


    this._repeat = this._initialRepeat;

    if (this._reversed) {
      // If we were reversed (f.e. using the yoyo feature) then we need to
      // flip the tween direction back to forward.
      this._reversed = false;

      for (const property in this._valuesStartRepeat) {
        this._swapEndStartRepeatValues(property);

        this._valuesStart[property] = this._valuesStartRepeat[property];
      }
    }

    this._isPlaying = true;
    this._isPaused = false;
    this._onStartCallbackFired = false;
    this._isChainStopped = false;
    this._startTime = now();
    this._startTime += this._delayTime;

    this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat);

    if (!this.isAddToRabbit) {
      this.isAddToRabbit = true;
      Rabbit.Instance.world.tweenSystem.addTween(this);
    }

    return this;
  }

  _setupProperties(_object, _valuesStart, _valuesEnd, _valuesStartRepeat) {
    for (const property in _valuesEnd) {
      const startValue = _object[property];
      const startValueIsArray = Array.isArray(startValue);
      const propType = startValueIsArray ? 'array' : typeof startValue;
      const isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]); // If `to()` specifies a property that doesn't exist in the source object,
      // we should not set that property in the object

      if (propType === 'undefined' || propType === 'function') {
        continue;
      } // Check if an Array was provided as property value


      if (isInterpolationList) {
        let endValues = _valuesEnd[property];

        if (endValues.length === 0) {
          continue;
        } // handle an array of relative values


        endValues = endValues.map(this._handleRelativeValue.bind(this, startValue)); // Create a local copy of the Array with the start value at the front

        _valuesEnd[property] = [startValue].concat(endValues);
      } // handle the deepness of the values


      if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
        _valuesStart[property] = startValueIsArray ? [] : {}; // eslint-disable-next-line

        for (const prop in startValue) {
          // eslint-disable-next-line
          // @ts-ignore FIXME?
          _valuesStart[property][prop] = startValue[prop];
        }

        _valuesStartRepeat[property] = startValueIsArray ? [] : {}; // TODO? repeat nested values? And yoyo? And array values?
        // eslint-disable-next-line
        // @ts-ignore FIXME?

        this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property]);
      } else {
        // Save the starting value, but only once.
        if (typeof _valuesStart[property] === 'undefined') {
          _valuesStart[property] = startValue;
        }

        if (!startValueIsArray) {
          // eslint-disable-next-line
          // @ts-ignore FIXME?
          _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
        }

        if (isInterpolationList) {
          // eslint-disable-next-line
          // @ts-ignore FIXME?
          _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
        } else {
          _valuesStartRepeat[property] = _valuesStart[property] || 0;
        }
      }
    }
  }

  stop() {
    if (!this._isChainStopped) {
      this._isChainStopped = true;
      this.stopChainedTweens();
    }

    if (!this._isPlaying) {
      return this;
    } // eslint-disable-next-line
    // this._group && this._group.remove(this as any)


    this._isPlaying = false;
    this._isPaused = false;

    if (this._onStopCallback) {
      this._onStopCallback(this._object);
    }

    return this;
  }

  end() {
    this._goToEnd = true;
    this.update(Infinity);
    return this;
  }

  pause(time = now()) {
    if (this._isPaused || !this._isPlaying) {
      return this;
    }

    this._isPaused = true;
    this._pauseStart = time; // eslint-disable-next-line
    // this._group && this._group.remove(this as any)

    return this;
  }

  resume(time = now()) {
    if (!this._isPaused || !this._isPlaying) {
      return this;
    }

    this._isPaused = false;
    this._startTime += time - this._pauseStart;
    this._pauseStart = 0; // eslint-disable-next-line
    // this._group && this._group.add(this as any)

    return this;
  }

  stopChainedTweens() {
    for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
      this._chainedTweens[i].stop();
    }

    return this;
  } // group(group = mainGroup): this {
  // 	this._group = group
  // 	return this
  // }


  delay(amount = 0) {
    this._delayTime = amount * 1000;
    return this;
  }

  repeat(times = 0) {
    this._initialRepeat = times;
    this._repeat = times;
    return this;
  }

  repeatDelay(amount) {
    this._repeatDelayTime = amount;
    return this;
  }

  yoyo(yoyo = false) {
    this._yoyo = yoyo;
    return this;
  }

  easing(easingFunction = Easing.Linear.None) {
    this._easingFunction = easingFunction;
    return this;
  }

  interpolation(interpolationFunction = Interpolation.Linear) {
    this._interpolationFunction = interpolationFunction;
    return this;
  } // eslint-disable-next-line


  chain(...tweens) {
    this._chainedTweens = tweens;
    return this;
  }

  onStart(callback) {
    this._onStartCallback = callback;
    return this;
  }

  onUpdate(callback) {
    this._onUpdateCallback = callback;
    return this;
  }

  onRepeat(callback) {
    this._onRepeatCallback = callback;
    return this;
  }

  onComplete(callback) {
    this._historys.push({
      type: TweenHistoryType.onComplete,
      args: [callback]
    });

    return this;
  }

  _onComplete(callback) {
    this._onCompleteCallback = callback;
    return this;
  }

  onStop(callback) {
    this._onStopCallback = callback;
    return this;
  }

  /**
   * @returns true if the tween is still playing after the update, false
   * otherwise (calling update on a paused tween still returns true because
   * it is still playing, just paused).
   */
  update(time = now()) {
    if (this._isPaused) return true;
    if (!this.isPlaying()) return true;
    let property;
    let elapsed;
    const endTime = this._startTime + this._duration;

    if (!this._goToEnd && !this._isPlaying) {
      if (time > endTime) return false;
    }

    this._goToEnd = false;

    if (time < this._startTime) {
      return true;
    }

    if (this._onStartCallbackFired === false) {
      if (this._onStartCallback) {
        this._onStartCallback(this._object);
      }

      this._onStartCallbackFired = true;
    }

    elapsed = (time - this._startTime) / this._duration;
    elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;

    const value = this._easingFunction(elapsed); // properties transformations


    this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);

    if (this._onUpdateCallback) {
      this._onUpdateCallback(this._object, elapsed);
    }

    if (elapsed === 1) {
      if (this._repeat > 0) {
        if (isFinite(this._repeat)) {
          this._repeat--;
        } // Reassign starting values, restart by making startTime = now


        for (property in this._valuesStartRepeat) {
          if (!this._yoyo && typeof this._valuesEnd[property] === 'string') {
            this._valuesStartRepeat[property] = // eslint-disable-next-line
            // @ts-ignore FIXME?
            this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
          }

          if (this._yoyo) {
            this._swapEndStartRepeatValues(property);
          }

          this._valuesStart[property] = this._valuesStartRepeat[property];
        }

        if (this._yoyo) {
          this._reversed = !this._reversed;
        }

        if (this._repeatDelayTime !== undefined) {
          this._startTime = time + this._repeatDelayTime;
        } else {
          this._startTime = time + this._delayTime;
        }

        if (this._onRepeatCallback) {
          this._onRepeatCallback(this._object);
        }

        return true;
      } else {
        for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
          // Make the chained tweens start exactly at the time they should,
          // even if the `update()` method was called way past the duration of the tween
          this._chainedTweens[i].start();
        }

        this._isPlaying = false;

        if (this._onCompleteCallback) {
          this._onCompleteCallback(this._object);
        }

        return false;
      }
    }

    return true;
  }

  _updateProperties(_object, _valuesStart, _valuesEnd, value) {
    for (const property in _valuesEnd) {
      // Don't update properties that do not exist in the source object
      if (_valuesStart[property] === undefined) {
        continue;
      }

      const start = _valuesStart[property] || 0;
      let end = _valuesEnd[property];
      const startIsArray = Array.isArray(_object[property]);
      const endIsArray = Array.isArray(end);
      const isInterpolationList = !startIsArray && endIsArray;

      if (isInterpolationList) {
        _object[property] = this._interpolationFunction(end, value);
      } else if (typeof end === 'object' && end) {
        // eslint-disable-next-line
        // @ts-ignore FIXME?
        this._updateProperties(_object[property], start, end, value);
      } else {
        // Parses relative end values with start as base (e.g.: +10, -3)
        end = this._handleRelativeValue(start, end); // Protect against non numeric properties.

        if (typeof end === 'number') {
          // eslint-disable-next-line
          // @ts-ignore FIXME?
          _object[property] = start + (end - start) * value;
        }
      }
    }
  }

  _handleRelativeValue(start, end) {
    if (typeof end !== 'string') {
      return end;
    }

    if (end.charAt(0) === '+' || end.charAt(0) === '-') {
      return start + parseFloat(end);
    } else {
      return parseFloat(end);
    }
  }

  _swapEndStartRepeatValues(property) {
    const tmp = this._valuesStartRepeat[property];
    const endValue = this._valuesEnd[property];

    if (typeof endValue === 'string') {
      this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue);
    } else {
      this._valuesStartRepeat[property] = this._valuesEnd[property];
    }

    this._valuesEnd[property] = tmp;
  }

} // eslint-disable-next-line

export default Tween;