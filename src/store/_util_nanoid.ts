export function nanoid(length = 16): string {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-";
  let id = "";
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    for (let i = 0; i < length; i += 1) id += alphabet[bytes[i] % alphabet.length];
    return id;
  }
  while (id.length < length) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}
