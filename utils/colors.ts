// A simple hashing function
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generate a color from a string
export const generateColorFromString = (str: string): string => {
  const hash = simpleHash(str);
  const hue = hash % 360;
  // Using HSL for more pleasant, consistent colors
  // Saturation: 60-80%, Lightness: 40-60%
  const saturation = 60 + (hash % 21);
  const lightness = 45 + (hash % 21);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
