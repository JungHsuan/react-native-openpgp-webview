# react-native-openpgp-webview

This is a simple example to run openpgpjs using react-native-webview.<br>This is a full react-native project. You can simply clone and run on simulator or real devices.

Here we use [react-native-webview](https://github.com/react-native-webview/react-native-webview) to open a simple `html` which we load [openpgpjs](https://github.com/openpgpjs/openpgpjs) library by adding `<script/>` like this:
```
<html>
  <body>
    <script src="https://unpkg.com/openpgp@5.3.0/dist/openpgp.min.js"></script>
    <div>hello word</div>
  </body>
</html>
```

Then, we can inject some js code to run `openpgp` by calling the method [injectJavaScript()](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#injectjavascriptstr).<br>Example javaScript code to use `openpgp`:

```
const jscode = `(async () => {
    const message = await openpgp.createMessage({
        binary: new Uint8Array([0x01, 0x01, 0x01]),
    });
    const encrypted = await openpgp.encrypt({
      message, // input as Message object
      passwords: ["secret stuff"], // multiple passwords possible
      format: "binary", // don't ASCII armor (for Uint8Array output)
    });
    console.log(encrypted); // Uint8Array
 };
 true;`;
```
Finally, inject this code by:
```
webViewRef.current.injectJavaScript(jscode);
```

## 
That's it!<br>
You can find full code in `App.js`
