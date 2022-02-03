import unpack from './unpack';
import v from '../../data/timezones/version.json';
import dt from '../dateTimeObj';

let { ONE_MIN_IN_MILLIS, millis, browserOffset } = dt;

// Utils

const check = offset => {
  if (Math.abs(offset) < 16) {
    return offset / 60;
  }
  return offset;
};

const add = (date, offset) => {
  let timestamp = millis(date);
  return Number(timestamp) + offset * ONE_MIN_IN_MILLIS;
};


// Time zone Object

const timezoneObj = {

  // Private state
  _unpacked: [],
  _packed: [],
  _defaultTimezone: null,
  _staticDomain: null,

  // Private Methods

  _utcOffset(timestamp, timezone) {
    try {
      let { untils, offsets } = this.data(timezone);

      let target = +timestamp, i;

      for (i = 0; i < untils.length; i++) {
        if (target < untils[i]) {
          return check(offsets[i]);
        }
      }
    } catch (err) {
      return browserOffset;
    }
  },

  _parse(timestamp, timezone) {
    try {
      let { offsets, untils } = this.data(timezone);

      let target = +timestamp;
      let max = untils.length - 1, offset, i, offsetPrev, offsetNext;

      for (i = 0; i < max; i++) {
        offset = offsets[i];
        offsetNext = offsets[i + 1];
        offsetPrev = offsets[i ? i - 1 : i];

        if (offset < offsetNext) {
          offset = offsetNext;
        } else if (offset > offsetPrev) {
          offset = offsetPrev;
        }

        if (target < untils[i] - (offset * ONE_MIN_IN_MILLIS)) {
          return check(offsets[i]);
        }
      }

      return check(offsets[max]);  
    } catch (err) {
      return browserOffset;
    }

  },

  //Public Methods

  unpack,

  add,

  set({ domain, _default, timezone, _packed, _unpacked }) {
    Boolean(domain) && (this._staticDomain = domain);
    Boolean(_default) && (this._defaultTimezone = _default) &&
    (
      Boolean(timezone) && 
      Boolean(_packed) && (this._packed[timezone] = _packed, this._unpacked[timezone] = unpack(_packed)) ||
      Boolean(_unpacked) && (this._unpacked[timezone] = _unpacked)
    );
  },

  get(timezone) {
    const tzStr = timezone.replace(/\//g, '_');
    const url = `${this._staticDomain.replace(/\/?$/, '/')}${tzStr}_${v.version}.json`;
    return fetch(url).then(res => res.json())
      .then(({ data }) => {
        this._packed[timezone] = data;
        this._unpacked[timezone] = unpack(data);
      });
  },

  data(timezone) {
    if (typeof timezone === 'string') {
      let data = this._unpacked[timezone];
      if (Boolean(data)) {
        return data;
      }
      throw new Error(`${timezone} is not loaded yet. use datetime.tz.get() to fetch the data !!`);
    } else if (typeof timezone === 'object') {
      return timezone;
    } else if (Boolean(this._defaultTimezone)) {
      return this._unpacked[this._defaultTimezone];
    }
    throw new Error('Incorrect timezone passed to the function');
  },

  utcToTz(date, timezone) {
    let timestamp = millis(date);
    let offset = this._utcOffset(timestamp, timezone);
    return add(timestamp, -offset);
  },

  tzToUtc(userDate, timezone) {
    let timestamp = millis(userDate);
    let offset = this._parse(timestamp, timezone);
    return add(timestamp, offset);
  },

  offset(date, timezone) {
    return this._utcOffset(millis(date), timezone);
  }

};

export default timezoneObj;