declare module 'react-native-base64' {
  export function encode(input: string): string;
  export function decode(input: string): string;
  export function encodeFromHexString(hex: string): string;
  export function decodeToHexString(base64: string): string;
}
