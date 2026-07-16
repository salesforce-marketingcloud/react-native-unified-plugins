import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { color } from "../colors";

export function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionHeader}>{title.toUpperCase()}</Text>;
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

interface RowProps {
  label: string;
  value?: string | null;
  onPress?: () => void;
}

export function Row({ label, value, onPress }: RowProps) {
  return (
    <TouchableOpacity
      style={s.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Text style={s.rowLabel}>{label}</Text>
      {value != null && (
        <Text style={s.rowValue} numberOfLines={1}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function MultilineRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      {value != null && <Text style={s.multilineValue}>{value}</Text>}
    </View>
  );
}

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({
  title,
  onPress,
  destructive,
  disabled,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        s.button,
        destructive && s.buttonDestructive,
        disabled && s.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[s.buttonText, destructive && s.buttonTextDestructive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

type BadgeStatus = "ready" | "error" | "loading" | "warn";

export function StatusBadge({
  status,
  label,
}: {
  status: BadgeStatus;
  label: string;
}) {
  const dotColor: Record<BadgeStatus, object> = {
    ready: { backgroundColor: color("systemGreen") },
    error: { backgroundColor: color("systemRed") },
    loading: { backgroundColor: color("systemOrange") },
    warn: { backgroundColor: color("systemOrange") },
  };
  return (
    <View style={s.badge}>
      <View style={[s.dot, dotColor[status]]} />
      <Text style={s.badgeLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: color("secondaryLabel"),
    marginTop: 24,
    marginBottom: 6,
    marginHorizontal: 16,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: color("secondarySystemGroupedBackground"),
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color("separator"),
  },
  rowLabel: {
    fontSize: 15,
    color: color("label"),
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    color: color("secondaryLabel"),
    maxWidth: "55%",
    textAlign: "right",
  },
  multilineValue: {
    fontSize: 13,
    color: color("secondaryLabel"),
    flex: 1,
    textAlign: "right",
    fontFamily: "Menlo",
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: color("systemBlue"),
  },
  buttonDestructive: {
    backgroundColor: color("systemRed"),
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextDestructive: {
    color: "#fff",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeLabel: {
    fontSize: 13,
    color: color("secondaryLabel"),
  },
});
