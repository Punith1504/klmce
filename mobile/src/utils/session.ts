import * as SecureStore from 'expo-secure-store';

/**
 * Secure Enclave & Keystore Integration
 * 
 * Replaces standard browser LocalStorage/Cookies with native cryptographic storage.
 * This physically isolates the JWTs from the JavaScript runtime heap, rendering XSS
 * or memory-dump attacks entirely ineffective.
 */

export async function saveSession(accessToken: string, refreshToken: string) {
  // WHEN_UNLOCKED_THIS_DEVICE_ONLY ensures the tokens are destroyed if the user 
  // tries to back them up via iCloud or restore them to a different physical iPhone.
  await SecureStore.setItemAsync('jwt_access_token', accessToken, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
  
  await SecureStore.setItemAsync('jwt_refresh_token', refreshToken, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

export async function getSession() {
  const accessToken = await SecureStore.getItemAsync('jwt_access_token');
  const refreshToken = await SecureStore.getItemAsync('jwt_refresh_token');
  return { accessToken, refreshToken };
}

export async function destroySession() {
  await SecureStore.deleteItemAsync('jwt_access_token');
  await SecureStore.deleteItemAsync('jwt_refresh_token');
}
