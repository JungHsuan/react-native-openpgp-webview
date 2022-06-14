import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
} from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import WebView from "react-native-webview";

const OpenpgpWebView = forwardRef(({ publicKey, message, onDone }, ref) => {
  const webViewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    encrypt: encrypt,
  }));

  function encrypt(publicKey, message) {
    if (webViewRef?.current != null && publicKey != null && message != null) {
      const jscode = `(async () => {
        const publicKey = '${publicKey}';
        const _message = '${message}';
        try {
          const message = await openpgp.createMessage({
            text: _message,
          });
          const decodedPublicKey = await openpgp.readKey({
            armoredKey: atob(publicKey),
          });
          const encrypted = await openpgp.encrypt({
            message,
            encryptionKeys: decodedPublicKey,
          });
          window.ReactNativeWebView.postMessage(btoa(encrypted));
        } catch (ex) {
          window.ReactNativeWebView.postMessage('error');
					alert(ex);
        }
      })();
      true;`;
      console.log("injecting script...");
      try {
        webViewRef.current.injectJavaScript(jscode);
      } catch (ex) {
        Alert.alert(ex);
      }
    }
  }

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", zIndex: -100, opacity: 0 }}
    >
      <WebView
        style={{ opacity: 0.99 }}
        incognito={true}
        ref={(ref) => (webViewRef.current = ref)}
        onMessage={(event) => {
          onDone && onDone(event.nativeEvent.data);
        }}
        javaScriptEnabled
        startInLoadingState
        allowUniversalAccessFromFileURLs={true}
        source={{
          html: `<html><body><script src="https://unpkg.com/openpgp@5.3.0/dist/openpgp.min.js"></script><div>hello word</div></body></html>`,
        }}
      />
    </View>
  );
});

const App = () => {
  // public key must without spaces, linebreaks or other invalid characters
  const publicKey = `LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tClZlcnNpb246IEJDUEcgdjEuNTQKCm1RRU5CRjE1Rm5NQkNBQzhhTStXWEpjcUhSeW5KUWlSTm03eExoN1Q3cmxpZkYvVnpncW01eDdGWnYvNGhXNWoKQTRibktaOFpZT0swNzVlbFljRGpUL2M1bDdMT25YRllBell3eENkc21nbm1HLzMzcXJPV08rUmxBbVREODZSWQowYWFZVWNIRkxUc0ttK29GNkpJMVB4NGd5c0xndlNlSUFCSEJvTlErU2N4dXgzM2VTZUlBMGg3L3dURFgzOU15CnM2YURmbWgvVWpnb0hhRDM5SjhDWUJpNVMyRGVzbjVLK2tjM0NkOUU1SVhGcjVhNG9mWmpWcGJJL092MGxOclkKZXQydDAzVHdEdGJ2VUtYUkxxejg5d1BvdEtGdldlTHZrOXlUZ3Jmd3BsSSs5ZEJCeUFqNHVVQUswNlBUUFJtTgpVWWUxNGQ4eFVOeWJpN1k5bGpSbU80blBIOWh3bTJ4SVZuU0JBQkVCQUFHMEJrTnBjbU5zWllrQkhBUVFBUWtBCkJnVUNYWGtXY3dBS0NSREpQWEtSZEw4TmRDc29CLzlid3pabnEwT0pNKzEvbnREYmhDcnZOaGJoQUhvd3RNclgKMmhqRmVhTy82ZHp2RXJpL25wVml5SzVsVjdMa0lkQi8ybS9sTEx0Nm9KZWdpeXoreXZlZ0pwTGQ0UmRvUC9CSgp0bHBBNjVwbFQyQys4UENoNkJRSCtIMVVZOE92TTFXT0p2VzBjU09xNzdzS3p1RFo4dGQ0OUVnTkpGdzlmb0dnClhYa1I0VHppSzdGTTZXQnlnYmdCNjVrQzZCVHJGNjRtY21xWHFrTHMyUVY5SEtTWmpHOTNxMGJHaUo0RStLbjYKam91dFhlVGc1YWZVL3VwN0g1TWxXM25mU3MyWHRLbFZ5MDdOQ1JYeCtwZUFzUEhpdmFGc3VDK3JUbTIwYVhWTwp5WUhJcmdsKzFNSktaWVNzRVRYMm8xaGkrWXVVeWRJMThuZmMzMGVSYVhyRVF5VzFWZ0w3Cj1CbXVaCi0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0=`;
  const [message, setMessage] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(!message);
  const [result, setResult] = useState(null);
  const openpgpRef = useRef(null);

  useEffect(() => {
    setBtnDisabled(!message);
  }, [message]);

  function handleBtnPress() {
    if (openpgpRef?.current) {
      setResult(null);
      openpgpRef.current.encrypt(publicKey, message);
    }
  }

  function handleEncryptedDone(encryptedMessage) {
    setResult(encryptedMessage);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <OpenpgpWebView
        ref={(ref) => (openpgpRef.current = ref)}
        onDone={handleEncryptedDone}
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text
          style={{
            fontSize: 22,
            paddingHorizontal: 40,
            marginTop: 40,
            color: "#222",
          }}
        >
          This is an simple example of running
          <Text style={{ color: "blue" }}>{` openpgpjs `}</Text>
          in React Native through
          <Text style={{ color: "red" }}>{` react-native-webview`}</Text>.
        </Text>

        <TextInput
          placeholder="message to encrypt"
          numberOfLines={1}
          style={{
            marginHorizontal: 40,
            height: 40,
            fontSize: 20,
            color: "#222",
            borderBottomColor: "rgba(0,0,0,0.5)",
            borderBottomWidth: 0.5,
          }}
          onChangeText={(value) => setMessage(value)}
          value={message}
        />

        <TouchableOpacity
          onPress={handleBtnPress}
          disabled={btnDisabled}
          style={{
            width: 120,
            height: 48,
            borderRadius: 24,
            backgroundColor: btnDisabled ? "#ddd" : "red",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
            alignSelf: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: "#fff" }}>Encrypt</Text>
        </TouchableOpacity>

        <Text style={{ paddingHorizontal: 40, marginTop: 20 }}>{result}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
