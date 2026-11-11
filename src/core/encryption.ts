export const encryptForStorage = (value: string) => {
  return btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16))));
};

export const decryptFromStorage = (value: string) => {
  const text = atob(value);
  return decodeURIComponent(Array.from(text).map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
};
