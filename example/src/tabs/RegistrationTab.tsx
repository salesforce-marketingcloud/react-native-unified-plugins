import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { color } from "../colors";
import type { SFMCSdkApi } from "@sfmc/react-native-sfmc-core";
import type { MCApi } from "@sfmc/react-native-marketingcloudsdk";
import { SectionHeader, Card, PrimaryButton } from "../components";

interface Props {
  sfmc: SFMCSdkApi;
  mc: MCApi;
}

interface SavedAttr {
  key: string;
  value: string;
}

export default function RegistrationTab({ sfmc, mc }: Props) {
  const [profileId, setProfileId] = useState("");
  const [partyName, setPartyName] = useState("");
  const [partyNumber, setPartyNumber] = useState("");
  const [partyType, setPartyType] = useState("");
  const [attrKey, setAttrKey] = useState("");
  const [attrValue, setAttrValue] = useState("");
  const [savedAttrs, setSavedAttrs] = useState<SavedAttr[]>([]);
  const [tag, setTag] = useState("");
  const [savedTags, setSavedTags] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Per-call try/catch so a single missing/failed getter (e.g. a future SDK rev
  // that drops a FRAGMENT) doesn't blank the rest of the tab.
  async function loadIdentity() {
    try {
      setProfileId((await sfmc.getProfileId?.()) ?? "");
    } catch {
      setProfileId("");
    }
    try {
      setPartyName((await sfmc.getPartyIdentificationName?.()) ?? "");
    } catch {
      setPartyName("");
    }
    try {
      setPartyNumber((await sfmc.getPartyIdentificationNumber?.()) ?? "");
    } catch {
      setPartyNumber("");
    }
    try {
      setPartyType((await sfmc.getPartyIdentificationType?.()) ?? "");
    } catch {
      setPartyType("");
    }
    try {
      const attrs = await sfmc.getAttributes?.();
      setSavedAttrs(
        attrs
          ? Object.entries(attrs).map(([key, value]) => ({
              key,
              value: String(value),
            }))
          : [],
      );
    } catch {
      setSavedAttrs([]);
    }
    try {
      setSavedTags((await mc.getTags?.()) ?? []);
    } catch {
      setSavedTags([]);
    }
    setLoaded(true);
  }

  useEffect(() => {
    loadIdentity();
  }, []);

  async function saveProfileId() {
    if (!profileId.trim()) {
      Alert.alert("Enter a profile ID");
      return;
    }
    await sfmc.setProfileId(profileId.trim());
    await loadIdentity();
    Alert.alert("Saved", `Profile ID set to "${profileId.trim()}"`);
  }

  async function savePartyIdentification() {
    await sfmc.setPartyIdentificationName(partyName.trim());
    await sfmc.setPartyIdentificationNumber(partyNumber.trim());
    await sfmc.setPartyIdentificationType(partyType.trim());
    await loadIdentity();
    Alert.alert("Saved", "Party identification updated.");
  }

  async function saveAttribute() {
    if (!attrKey.trim()) {
      Alert.alert("Enter an attribute key");
      return;
    }
    await sfmc.setAttribute(attrKey.trim(), attrValue.trim());
    setAttrKey("");
    setAttrValue("");
    await loadIdentity();
  }

  async function clearAttribute(key: string) {
    await sfmc.clearAttribute(key);
    await loadIdentity();
  }

  async function addTag() {
    if (!tag.trim()) {
      Alert.alert("Enter a tag");
      return;
    }
    if (savedTags.includes(tag.trim())) {
      Alert.alert("Tag already added");
      return;
    }
    await mc.addTag(tag.trim());
    setTag("");
    await loadIdentity();
  }

  async function removeTag(t: string) {
    await mc.removeTag(t);
    await loadIdentity();
  }

  if (!loaded) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={color("systemBlue")} />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Profile ID */}
      <SectionHeader title="Profile" />
      <Card>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Profile ID / Contact Key"
            placeholderTextColor={color("placeholderText")}
            value={profileId}
            onChangeText={setProfileId}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={saveProfileId}
          />
        </View>
      </Card>
      <PrimaryButton title="Set Profile ID" onPress={saveProfileId} />

      {/* Party Identification */}
      <SectionHeader title="Party Identification" />
      <Card>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Name"
            placeholderTextColor={color("placeholderText")}
            value={partyName}
            onChangeText={setPartyName}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <View style={[s.inputRow, s.inputRowBorder]}>
          <TextInput
            style={s.input}
            placeholder="Number"
            placeholderTextColor={color("placeholderText")}
            value={partyNumber}
            onChangeText={setPartyNumber}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="default"
          />
        </View>
        <View style={[s.inputRow, s.inputRowBorder]}>
          <TextInput
            style={s.input}
            placeholder="Type"
            placeholderTextColor={color("placeholderText")}
            value={partyType}
            onChangeText={setPartyType}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={savePartyIdentification}
          />
        </View>
      </Card>
      <PrimaryButton
        title="Save Party Identification"
        onPress={savePartyIdentification}
      />

      {/* Attributes */}
      <SectionHeader title="Attributes" />
      <Card>
        <View style={s.inputRow}>
          <TextInput
            style={[s.input, s.inputHalf]}
            placeholder="Key"
            placeholderTextColor={color("placeholderText")}
            value={attrKey}
            onChangeText={setAttrKey}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TextInput
            style={[s.input, s.inputHalf]}
            placeholder="Value"
            placeholderTextColor={color("placeholderText")}
            value={attrValue}
            onChangeText={setAttrValue}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={saveAttribute}
          />
        </View>
        {savedAttrs.map((a) => (
          <View key={a.key} style={s.savedRow}>
            <View style={s.savedRowText}>
              <Text style={s.savedKey}>{a.key}</Text>
              <Text style={s.savedValue}>{a.value}</Text>
            </View>
            <TouchableOpacity
              onPress={() => clearAttribute(a.key)}
              style={s.clearBtn}
            >
              <Text style={s.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Card>
      <PrimaryButton title="Save Attribute" onPress={saveAttribute} />

      {/* Tags */}
      <SectionHeader title="Tags" />
      <Card>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Tag name"
            placeholderTextColor={color("placeholderText")}
            value={tag}
            onChangeText={setTag}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={addTag}
          />
        </View>
        {savedTags.map((t) => (
          <View key={t} style={s.savedRow}>
            <Text style={s.savedKey}>{t}</Text>
            <TouchableOpacity onPress={() => removeTag(t)} style={s.clearBtn}>
              <Text style={[s.clearBtnText, s.removeText]}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Card>
      <PrimaryButton title="Add Tag" onPress={addTag} />

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: color("systemGroupedBackground") },
  content: { paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color("systemGroupedBackground"),
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color("separator"),
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: color("label"),
    paddingVertical: 4,
  },
  inputHalf: {
    flex: 1,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color("separator"),
  },
  savedRowText: {
    flex: 1,
    gap: 2,
  },
  savedKey: {
    fontSize: 14,
    fontWeight: "500",
    color: color("label"),
  },
  savedValue: {
    fontSize: 13,
    color: color("secondaryLabel"),
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: color("tertiarySystemFill"),
  },
  clearBtnText: {
    fontSize: 13,
    color: color("systemBlue"),
    fontWeight: "500",
  },
  removeText: {
    color: color("systemRed"),
  },
});
