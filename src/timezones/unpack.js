function charCodeToInt(charCode) {
  if (charCode > 96) {
    return charCode - 87;
  } else if (charCode > 64) {
    return charCode - 29;
  }
  return charCode - 48;
}
  
function unpackBase60(string) {
  let i = 0,
    parts = string.split('.'),
    [whole] = parts,
    fractional = parts[1] || '',
    multiplier = 1,
    num,
    out = 0,
    sign = 1;
  
  // handle negative numbers
  if (string.charCodeAt(0) === 45) {
    i = 1;
    sign = -1;
  }
  
  // handle digits before the decimal
  for (i; i < whole.length; i++) {
    num = charCodeToInt(whole.charCodeAt(i));
    out = 60 * out + num;
  }
  
  // handle digits after the decimal
  for (i = 0; i < fractional.length; i++) {
    multiplier = multiplier / 60;
    num = charCodeToInt(fractional.charCodeAt(i));
    out += num * multiplier;
  }
  
  return out * sign;
}
  
function arrayToInt(array) {
  for (let i = 0; i < array.length; i++) {
    array[i] = unpackBase60(array[i]);
  }
}
  
function intToUntil(array, length) {
  for (let i = 0; i < length; i++) {
    array[i] = Math.round((array[i - 1] || 0) + array[i] * 60000); // minutes to milliseconds
  }
  
  array[length - 1] = Infinity;
}
  
function mapIndices(source, indices) {
  let out = [],
    i;
  
  for (i = 0; i < indices.length; i++) {
    out[i] = source[indices[i]];
  }
  
  return out;
}
  
function unpack(string) {
  if (string) {
    let data = string.split('|'),
      offsets = data[0].split(' '),
      indices = data[1].split(''),
      untils = data[2].split(' ');
  
    arrayToInt(offsets);
    arrayToInt(indices);
    arrayToInt(untils);
  
    intToUntil(untils, indices.length);
  
    return {
      offsets: mapIndices(offsets, indices),
      untils
    };
  }
}

export default unpack;