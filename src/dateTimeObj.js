//Constants

const ONE_MIN_IN_MILLIS = 60000;

//Utils

const browserOffset = () => new Date().getTimezoneOffset();

const millis = date => date
  ? new Date(date).getTime()
  : new Date().getTime();

const ISO = date => date ? new Date(date).toISOString() : new Date().toISOString();

export const toDate = userDate => {
  const isoDate = ISO(userDate);
  let [year, month, day, hours, mins, seconds, millis] =
    isoDate.match(/[^-\"T:.Z]+/g).map(str => Number(str));
  return new Date(year, month - 1, day, hours, mins, seconds, millis);
};

//dateTime Object

export default {
  ONE_MIN_IN_MILLIS,
  millis,
  browserOffset,
  ISO,
  toDate
};