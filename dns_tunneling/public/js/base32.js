const base32Chars = 'abcdefghijklmnopqrstuvwxyz234567';

function base32Encode(input) {
  // const base32Chars = 'abcdefghijklmnopqrstuvwxyz234567';
  let result = '';
  let buffer = 0;
  let bufferLength = 0;

  for (let i = 0; i < input.length; i++) {
    buffer <<= 8;
    buffer |= input[i];
    bufferLength += 8;

    while (bufferLength >= 5) {
      const index = (buffer >> (bufferLength - 5)) & 31;
      result += base32Chars[index];
      bufferLength -= 5;
    }
  }

  if (bufferLength > 0) {
    buffer <<= (5 - bufferLength);
    const index = buffer & 31;
    result += base32Chars[index];
  }

  return result;
}

function encode_string (input) {

  const textEncoder = new TextEncoder(); // To convert a string to bytes
  const encoded = base32Encode(textEncoder.encode(input));
  console.log(encoded);
  return encoded;
}

function base32Decode(input) {

  const charMap = {};
  for (let i = 0; i < base32Chars.length; i++) {
    charMap[base32Chars[i]] = i;
  }

  let result = [];
  let buffer = 0;
  let bufferLength = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '=') {
      continue; // Skip padding characters
    }

    if (!(char in charMap)) {
      throw new Error(`Invalid character in input: ${char}`);
    }

    const bits = charMap[char];
    buffer <<= 5;
    buffer |= bits;
    bufferLength += 5;

    if (bufferLength >= 8) {
      result.push((buffer >> (bufferLength - 8)) & 255);
      bufferLength -= 8;
    }
  }

  return new Uint8Array(result);
}

function decoded_string (input) {

  const decoded = base32Decode(input);
  const textDecoder = new TextDecoder(); // To convert bytes to a string
  const decodedString = textDecoder.decode(decoded);
  return decodedString;
}