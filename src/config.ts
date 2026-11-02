// Debug builds talk to a backend on your computer. On Android (emulator or a
// USB-connected phone) run `adb reverse tcp:5000 tcp:5000` so the device's
// localhost:5000 reaches it. Release builds talk to the deployed API.
const DEV_HOST = 'http://localhost:5000';
const PROD_HOST = 'https://space7backend.onrender.com';

export const SERVER_URL = __DEV__ ? DEV_HOST : PROD_HOST;
export const API_URL = `${SERVER_URL}/api`;
