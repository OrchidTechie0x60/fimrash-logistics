package ng.fimrash.logistics;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Android's WebView ignores window.print(), so the web app calls this instead.
// It opens the system print screen for the current page (printers and "Save as PDF"),
// rendered with the page's @media print styles.
@CapacitorPlugin(name = "FimrashPrint")
public class PrintPlugin extends Plugin {

    @PluginMethod
    public void print(PluginCall call) {
        String name = call.getString("name", "Fimrash waybill");
        getActivity().runOnUiThread(() -> {
            try {
                WebView webView = getBridge().getWebView();
                PrintManager printManager = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(name);
                PrintAttributes attributes = new PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                        .build();
                printManager.print(name, adapter, attributes);
                call.resolve();
            } catch (Exception e) {
                call.reject("Could not open the print screen: " + e.getMessage());
            }
        });
    }
}
