# R8 rules for Subscription Plus (Capacitor)
#
# Capacitor finds plugins and their methods by annotation and calls them from
# the web view by name, so R8 must not rename or remove them. Capacitor and
# its official plugins ship most of these rules themselves; these are a
# safety net in case one doesn't.

# Plugins and the methods the web side calls
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.PluginMethod public <methods>;
    public <init>(...);
}
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep class com.getcapacitor.** { *; }

# The bridge between the web view and native code
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Annotations, plus readable crash line numbers without exposing file names
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
