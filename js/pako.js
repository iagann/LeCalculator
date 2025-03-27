function compressBuild(buildData) {
  const json = JSON.stringify(buildData);
  const deflated = pako.deflate(json, { level: 9 });
  // testing stuff
  /*
  if (0) {
    // Step 1: Encode compressed bytes into custom characters
    const s1 = encodeCustomBase(deflated, megaCharset);

    // Optional: lengths for comparison
    const t1 = s1.length;
    const t2 = btoa(String.fromCharCode(...deflated)).length;

    // Step 2: Decode custom characters back to bytes
    const byteArray = decodeCustomBase(s1, megaCharset);

    // Step 3: Inflate (decompress)
    const decompressed = pako.inflate(byteArray, { to: 'string' });

    // Step 4: Parse JSON
    const j = JSON.parse(decompressed);

    console.log(j);
  }

  if (0) {

    // Step 2: Decode custom characters back to bytes
    const byteArray = decodeCustomBase(s1, megaCharset);

    // Step 3: Inflate (decompress)
    const decompressed = pako.inflate(byteArray, { to: 'string' });

    // Step 4: Parse JSON
    const j = JSON.parse(decompressed);

    console.log(j);
  }
  */
  return encodeCustomBase(deflated, megaCharset);
  
  // old code in case new compression produces new bugs
  //return  btoa(String.fromCharCode(...deflated));
}

function decompressBuild(b64) {
  const byteArray = decodeCustomBase(b64, megaCharset);
  const decompressed = pako.inflate(byteArray, { to: 'string' });
  return JSON.parse(decompressed);

  // old code in case new compression produces new bugs
  /*
  const binary = atob(b64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  const decompressed = pako.inflate(array, { to: 'string' });
  return JSON.parse(decompressed);
  */
}

function generateMegaCharset() {
  const arr = [];

  // 1) Basic ASCII range: 32..126 (printable)
  for (let i = 32; i <= 126; i++) {
    // Skip backslash, quote, or backtick if you want to avoid escaping issues
    if (i !== 92 && i !== 34 && i !== 96) {
      arr.push(String.fromCharCode(i));
    }
  }

  // 2) Extended ASCII: 160..255
  // (Some of these might appear blank or be non-printable in some fonts)
  for (let i = 160; i <= 255; i++) {
    //arr.push(String.fromCharCode(i));
  }

  // 3) Cyrillic: 0x400..0x45F (basic Russian + a few extras)
  for (let i = 0x400; i <= 0x45F; i++) {
    arr.push(String.fromCharCode(i));
  }

  // 4) Greek: 0x370..0x3FF
  for (let i = 0x370; i <= 0x3FF; i++) {
    arr.push(String.fromCharCode(i));
  }

  // 5) Random sampling of “general punctuation” in 0x2000..0x206F
  for (let i = 0x2000; i <= 0x206F; i++) {
    //arr.push(String.fromCharCode(i));
  }

  // 6) Emojis! (Add as many as you want)
  // You can push entire ranges or pick them by hand
  const safeEmojiList = [
    "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😍","😘","😗","😙","😚","🙂","🤗","🤩","🤔","🤨","😐",
    "😑","😶","🙄","😏","😴","😪","😵","🤯","🤠","🥳","😈","👾","🧐","👻","💀","☠","👽","🤖","🎃","😺","😸","😹","😻","😼","😽",
    "🙀","😿","😾","🧠","😻","😹","😺","😼","🎈","🎉","🎊","🏆","🎮","🚀","🚁","🎷","🎸","🎹","🥁","🎵","🎶","🎵","🔔","📣","💫",
    "🌟","✨","⚡","⛈","❄","☂","💧","🔥","💥","🌈","⭐","☀","☁","☃","☄","☂","⚡","🌪","🌫","🌊","🚀","🌌","🌠","🪐","🌍","🌎",
    "🌏","🌐","🗺","🌋","⛰","🏰","🏯","🎠","🎡","🎢","🎪","🎭","🛩","🛫","🛬","🛰","🛸","🪂","🪁","✈","⏰","⏳","⏲","🕰","🔧","🧰",
    "🔨","🛠","🗡","💣","🕶","🎩","👜","👑","💎","🔑","🗝","🐱","🐶","🐺","🦊","🐸","🐵","🐯","🦁","🐣","🐤","🐥","🐦","🐧","🕊","🦇",
    "🐺","🐗","🐴","🦄","🐝","🐉","🐲","🐳","🐬","🐟","🐙","🐌","🐛","🦋","🐌","🐞","🐜","🪲","🕷","🐢","🐍","🦎","🐲","🐎","🐫",
    "🦏","🦛","🐘","🦍","🐇","🐀","🐿","🦨","🦡","🦔","🦦","🦥","🦫","🦃","🐓","🦆","🦅","🦉","🦇","🐝","🦋","🌸","🌻","🌹","🌼",
    "🌷","🍀","🍄","🌵","🌴","🌲","🌳","🌱","🍎","🍊","🍔","🍕","🍟","🍗","🍖","🌭","🌮","🌯","🍿","🍩","🍪","🧁","🍰","🍨","🍦",
    "🥛","🥤","🧋","🍵","🍺","🍻","🥂","🍷"
  ];
  //arr.push(...safeEmojiList);

  // Convert to a Set to remove duplicates
  const unique = new Set(arr);

  // Convert back to array
  const finalArr = [...unique];

  // (Optional) Sort the array if you want stable ordering:
  // finalArr.sort();

  return finalArr;
}

// Build the giant charset
const megaCharset = generateMegaCharset();
console.log("Mega charset length:", megaCharset.length);

function encodeCustomBase(uint8Array, charset) {
  // Quick safety check
  if (new Set(charset).size !== charset.length) {
    throw new Error("Custom charset has duplicates! Remove them first.");
  }

  const base = BigInt(charset.length);
  let value = 0n;
  for (let byte of uint8Array) {
    value = (value << 8n) | BigInt(byte);
  }
  if (value === 0n) {
    // If the data was all zero (rare), just return the first character
    return charset[0];
  }

  const result = [];
  while (value > 0n) {
    const digit = Number(value % base);
    result.push(charset[digit]);
    value /= base;
  }
  return result.reverse().join('');
}

function decodeCustomBase(encoded, charset) {
  if (new Set(charset).size !== charset.length) {
    throw new Error("Custom charset has duplicates! Remove them first.");
  }

  const base = BigInt(charset.length);
  let value = 0n;
  for (const ch of encoded) {
    const idx = charset.indexOf(ch);
    if (idx === -1) {
      throw new Error(`Invalid char in encoded string: "${ch}"`);
    }
    value = value * base + BigInt(idx);
  }

  // Convert BigInt back to bytes
  const bytes = [];
  while (value > 0n) {
    bytes.unshift(Number(value & 0xFFn));
    value >>= 8n;
  }
  return new Uint8Array(bytes);
}
