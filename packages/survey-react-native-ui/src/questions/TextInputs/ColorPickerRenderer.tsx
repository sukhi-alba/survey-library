import * as React from "react";
import { View, Text, Pressable, StyleSheet, Modal, TextInput } from "react-native";
import { QuestionTextModel } from "survey-core";
import { getTheme } from "../../theme";

interface ColorPickerProps {
  question: QuestionTextModel;
}

const PRESET_COLORS = [
  "#19b394", // Teal
  "#d9534f", // Red
  "#5cb85c", // Green
  "#0275d8", // Blue
  "#f0ad4e", // Orange
  "#6f42c1", // Purple
  "#e83e8c", // Pink
  "#ffc107", // Yellow
  "#343a40", // Dark
  "#6c757d", // Gray
  "#dcdcdc", // Light gray
  "#ffffff" // White
];

export function ColorPickerRenderer({ question }: ColorPickerProps) {
  const theme = getTheme();
  const [show, setShow] = React.useState(false);
  const value = question.value || "#ffffff";

  const [hexInput, setHexInput] = React.useState(value);

  // Sync state if model value changes programmatically
  React.useEffect(() => {
    setHexInput(question.value || "#ffffff");
  }, [question.value]);

  const selectColor = (color: string) => {
    question.value = color.toLowerCase();
    setHexInput(color);
  };

  const handleHexChange = (text: string) => {
    let formatted = text;
    if (!formatted.startsWith("#")) {
      formatted = "#" + formatted;
    }
    // Remove invalid characters
    formatted = formatted.replace(/[^#0-9A-Fa-f]/g, "");
    // Cap length to 7 characters (#ffffff)
    formatted = formatted.substring(0, 7);
    setHexInput(formatted);

    // Validate 3 or 6 hex digits
    if (formatted.length === 4 || formatted.length === 7) {
      question.value = formatted.toLowerCase();
    }
  };

  const confirmSelection = () => {
    if (hexInput.length === 4 || hexInput.length === 7) {
      question.value = hexInput.toLowerCase();
    }
    setShow(false);
  };

  return (
    <View>
      <Pressable
        disabled={question.isInputReadOnly}
        onPress={() => setShow(true)}
        style={[
          styles.pickerButton,
          {
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.small,
            backgroundColor: question.isInputReadOnly ? theme.colors.background : theme.colors.surface
          }
        ]}
      >
        <View style={styles.colorPreviewRow}>
          <View style={[styles.colorIndicator, { backgroundColor: value, borderColor: theme.colors.border }]} />
          <Text style={{ color: theme.colors.text, fontSize: 14, textTransform: "uppercase" }}>
            {value}
          </Text>
        </View>
        {!question.isInputReadOnly && <Text style={{ color: theme.colors.textLight, fontSize: 14 }}>{"\uD83C\uDFA8"}</Text>}
      </Pressable>

      {show && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={show}
          onRequestClose={() => setShow(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShow(false)}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.headerRow, { borderBottomColor: theme.colors.border }]}>
                <Text style={{ fontWeight: "bold", fontSize: 16, color: theme.colors.text }}>Select Color</Text>
                <Pressable onPress={confirmSelection}>
                  <Text style={{ color: theme.colors.primary, fontWeight: "bold", fontSize: 16 }}>Done</Text>
                </Pressable>
              </View>

              <View style={styles.pickerBody}>
                {/* Presets grid */}
                <View style={styles.grid}>
                  {PRESET_COLORS.map((c) => {
                    const isSelected = value.toLowerCase() === c.toLowerCase();
                    return (
                      <Pressable
                        key={c}
                        onPress={() => selectColor(c)}
                        style={[
                          styles.swatch,
                          {
                            backgroundColor: c,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                            borderWidth: isSelected ? 3 : 1
                          }
                        ]}
                      />
                    );
                  })}
                </View>

                {/* Custom Hex input */}
                <View style={styles.customRow}>
                  <Text style={[styles.customLabel, { color: theme.colors.textLight }]}>Hex Code:</Text>
                  <TextInput
                    style={[
                      styles.hexInput,
                      {
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                        borderRadius: theme.borderRadius.small
                      }
                    ]}
                    value={hexInput}
                    onChangeText={handleHexChange}
                    placeholder="#ffffff"
                    placeholderTextColor={theme.colors.placeholder}
                    maxLength={7}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44
  },
  colorPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end"
  },
  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 30
  },
  headerRow: {
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  pickerBody: {
    padding: 20,
    gap: 20
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between"
  },
  swatch: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 8
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  customLabel: {
    fontSize: 15,
    fontWeight: "bold"
  },
  hexInput: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    fontSize: 15
  }
});
