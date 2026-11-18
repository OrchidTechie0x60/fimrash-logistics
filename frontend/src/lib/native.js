// Android app (Capacitor) integration. No-ops in the browser.
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

export const isNativeApp = () => Capacitor.isNativePlatform();

// Hardware back button walks back through pages, and only closes the app from the home page.
export function installNativeBackButton() {
  if (!isNativeApp()) return;
  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack && window.location.pathname !== '/') window.history.back();
    else CapacitorApp.exitApp();
  });
}
