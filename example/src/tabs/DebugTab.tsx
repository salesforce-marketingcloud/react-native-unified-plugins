import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { color } from "../colors";
import type { SFMCSdkApi } from "@sfmc/react-native-sfmc-core";

interface Props {
  sfmc: SFMCSdkApi;
}

export default function DebugTab({ sfmc }: Props) {
  const [state, setState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await sfmc.getSdkState();
      setState(typeof raw === "string" ? raw : JSON.stringify(raw, null, 2));
    } catch (e: any) {
      setState("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [sfmc]);

  useEffect(() => {
    load();
  }, [load]);

  function copyState() {
    if (!state) return;
    Clipboard.setString(state);
    Alert.alert("Copied", "SDK state copied to clipboard.");
  }

  async function shareState() {
    if (!state) return;
    await Share.share({ message: state, title: "SFMC SDK State" });
  }

  return (
    <View style={s.container}>
      {/* Toolbar */}
      <View style={s.toolbar}>
        <TouchableOpacity
          style={s.toolbarBtn}
          onPress={load}
          disabled={loading}
        >
          <Text style={[s.toolbarBtnText, loading && s.disabled]}>
            {loading ? "Loading…" : "Refresh"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.toolbarBtn}
          onPress={copyState}
          disabled={!state}
        >
          <Text style={[s.toolbarBtnText, !state && s.disabled]}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.toolbarBtn}
          onPress={shareState}
          disabled={!state}
        >
          <Text style={[s.toolbarBtnText, !state && s.disabled]}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading && <ActivityIndicator style={s.spinner} />}
      {!loading && !state && (
        <View style={s.placeholder}>
          <Text style={s.placeholderText}>Tap Refresh to load SDK state</Text>
        </View>
      )}
      {!loading && state && (
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
          <Text style={s.stateText} selectable>
            {state}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: color("systemGroupedBackground") },
  toolbar: {
    flexDirection: "row",
    backgroundColor: color("secondarySystemGroupedBackground"),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color("separator"),
    paddingHorizontal: 8,
  },
  toolbarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  toolbarBtnText: {
    fontSize: 15,
    color: color("systemBlue"),
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.3,
  },
  spinner: { marginTop: 60 },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: {
    color: color("tertiaryLabel"),
    fontSize: 16,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 12 },
  stateText: {
    fontFamily: "Menlo",
    fontSize: 11,
    color: color("label"),
    lineHeight: 18,
  },
});
