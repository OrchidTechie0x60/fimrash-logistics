// Android app (Capacitor) integration. No-ops in the browser.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

export const isNativeApp = () => Capacitor.isNativePlatform();

// Native print bridge (android/.../PrintPlugin.java): Android's WebView ignores window.print().
const FimrashPrint = registerPlugin('FimrashPrint');

// Opens the print screen (printers and "Save as PDF") in the app, or the browser's print dialog on the web.
export async function printPage(name = 'Fimrash waybill') {
  if (isNativeApp()) {
    await FimrashPrint.print({ name });
  } else {
    window.print();
  }
}

// Hardware back button walks back through pages, and only closes the app from the home page.
export function installNativeBackButton() {
  if (!isNativeApp()) return;
  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack && window.location.pathname !== '/') window.history.back();
    else CapacitorApp.exitApp();
  });
}
