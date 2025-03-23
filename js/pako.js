function compressBuild(buildData) {
  // 1) Convert to JSON
  const json = JSON.stringify(buildData);

  // 2) Deflate (binary)
  const deflated = pako.deflate(json, { level: 9 }); 
    // level:9 => max compression

  // 3) Convert binary to base64
  let b64 = btoa(String.fromCharCode(...deflated));
  return b64;
}

function decompressBuild(b64) {
  // 1) Convert base64 to binary
  const binary = atob(b64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }

  // 2) Inflate
  const decompressed = pako.inflate(array, { to: 'string' });

  // 3) Parse JSON
  return JSON.parse(decompressed);
}