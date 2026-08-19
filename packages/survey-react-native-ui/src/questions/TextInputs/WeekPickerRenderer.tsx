import * as React from "react";
import { View, Text, Pressable, StyleSheet, Modal, FlatList } from "react-native";
import { QuestionTextModel } from "survey-core";
import { getTheme } from "../../theme";

interface WeekPickerProps {
  question: QuestionTextModel;
}

export function WeekPickerRenderer({ question }: WeekPickerProps) {
  const theme = getTheme();
  const [show, setShow] = React.useState(false);
  const value = question.value; // expected format: YYYY-Www

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    return Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);
  }, [currentYear]);

  const weeks = React.useMemo(() => {
    return Array.from({ length: 53 }, (_, i) => i + 1);
  }, []);

  // Initial temp states
  let initialYear = currentYear;
  let initialWeek = 1;
  if (value && typeof value === "string" && value.includes("-W")) {
    const parts = value.split("-W");
    if (parts.length === 2) {
      initialYear = parseInt(parts[0], 10);
      initialWeek = parseInt(parts[1], 10);
    }
  }

  const [tempYear, setTempYear] = React.useState(initialYear);
  const [tempWeek, setTempWeek] = React.useState(initialWeek);

  // Sync temp states if model value changes programmatically
  React.useEffect(() => {
    if (value && typeof value === "string" && value.includes("-W")) {
      const parts = value.split("-W");
      if (parts.length === 2) {
        setTempYear(parseInt(parts[0], 10));
        setTempWeek(parseInt(parts[1], 10));
      }
    }
  }, [value]);

  const confirmSelection = () => {
    question.value = `${tempYear}-W${String(tempWeek).padStart(2, "0")}`;
    setShow(false);
  };

  const displayText = value ? value : (question.placeholder || "Select Week");

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
        <Text style={{ color: value ? theme.colors.text : theme.colors.placeholder, fontSize: 14 }}>
          {displayText}
        </Text>
        {!question.isInputReadOnly && <Text style={{ color: theme.colors.textLight, fontSize: 14 }}>{"\uD83D\uDCC5"}</Text>}
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
                <Text style={{ fontWeight: "bold", fontSize: 16, color: theme.colors.text }}>
                  Select Week: {tempYear}-W{String(tempWeek).padStart(2, "0")}
                </Text>
                <Pressable onPress={confirmSelection}>
                  <Text style={{ color: theme.colors.primary, fontWeight: "bold", fontSize: 16 }}>Done</Text>
                </Pressable>
              </View>

              <View style={styles.pickerBody}>
                {/* Years column */}
                <View style={[styles.column, { borderRightColor: theme.colors.border, borderRightWidth: 1 }]}>
                  <Text style={[styles.columnHeader, { color: theme.colors.textLight }]}>Year</Text>
                  <FlatList
                    data={years}
                    keyExtractor={(item) => String(item)}
                    initialScrollIndex={years.indexOf(tempYear) - 3 >= 0 ? years.indexOf(tempYear) - 3 : 0}
                    getItemLayout={(data, index) => ({
                      length: 44,
                      offset: 44 * index,
                      index
                    })}
                    renderItem={({ item }) => {
                      const isSelected = item === tempYear;
                      return (
                        <Pressable
                          onPress={() => setTempYear(item)}
                          style={[
                            styles.item,
                            { backgroundColor: isSelected ? theme.colors.accent : "transparent" }
                          ]}
                        >
                          <Text style={{
                            color: isSelected ? theme.colors.primary : theme.colors.text,
                            fontWeight: isSelected ? "bold" : "normal",
                            fontSize: 15
                          }}>
                            {item}
                          </Text>
                        </Pressable>
                      );
                    }}
                  />
                </View>

                {/* Weeks column */}
                <View style={styles.column}>
                  <Text style={[styles.columnHeader, { color: theme.colors.textLight }]}>Week</Text>
                  <FlatList
                    data={weeks}
                    keyExtractor={(item) => String(item)}
                    initialScrollIndex={weeks.indexOf(tempWeek) - 3 >= 0 ? weeks.indexOf(tempWeek) - 3 : 0}
                    getItemLayout={(data, index) => ({
                      length: 44,
                      offset: 44 * index,
                      index
                    })}
                    renderItem={({ item }) => {
                      const isSelected = item === tempWeek;
                      return (
                        <Pressable
                          onPress={() => setTempWeek(item)}
                          style={[
                            styles.item,
                            { backgroundColor: isSelected ? theme.colors.accent : "transparent" }
                          ]}
                        >
                          <Text style={{
                            color: isSelected ? theme.colors.primary : theme.colors.text,
                            fontWeight: isSelected ? "bold" : "normal",
                            fontSize: 15
                          }}>
                            Week {String(item).padStart(2, "0")}
                          </Text>
                        </Pressable>
                      );
                    }}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end"
  },
  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "50%",
    paddingBottom: 20
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
    flexDirection: "row",
    height: 240
  },
  column: {
    flex: 1
  },
  columnHeader: {
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  item: {
    height: 44,
    justifyContent: "center",
    alignItems: "center"
  }
});
