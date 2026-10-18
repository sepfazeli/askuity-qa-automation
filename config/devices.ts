export interface DeviceProfile {
  name: string;
  width: number;
  height: number;
  pixelRatio: number;
  userAgent: string;
}

const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const IPAD_UA =
  'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

// Explicit sizes, because Chrome's built-in device names change between versions.
export const DEVICES: readonly DeviceProfile[] = [
  { name: 'iPhone SE', width: 375, height: 667, pixelRatio: 2, userAgent: IOS_UA },
  { name: 'Pixel 7', width: 412, height: 915, pixelRatio: 2.625, userAgent: ANDROID_UA },
  { name: 'iPad Mini', width: 768, height: 1024, pixelRatio: 2, userAgent: IPAD_UA },
];
