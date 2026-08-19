import * as React from "react";
import { View, Text, Pressable, StyleSheet, Modal, FlatList } from "react-native";
import { QuestionTextModel } from "survey-core";
import { getTheme } from "../../theme";

interface MonthPickerProps {
  question: QuestionTextModel;
}

const MONTHS = [
  { val: 1, text: "Jan" },
  { val: 2, text: "Feb" },
  { val: 3, text: "Mar" },
  { val: 4, text: "Apr" },
  { val: 5, text: "May" },
  { val: 6, text: "Jun" },
  { val: 7, text: "Jul" },
  { val: 8, text: "Aug" },
  { val: 9, text: "Sep" },
  { val: 10, text: "Oct" },
  { val: 11, text: "Nov" },
  { val: 12, text: "Dec" }
];

export function MonthPickerRenderer({ question }: MonthPickerProps) {
  const theme = getTheme();
  const [show, setShow] = React.useState(false);
  const value = question.value; // expected format: YYYY-MM

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    return Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);
  }, [currentYear]);

  // Initial temp states
  let initialYear = currentYear;
  let initialMonth = 1;
  if (value && typeof value === "string" && value.includes("-")) {
    const parts = value.split("-").map(Number);
    if (parts.length === 2) {
      initialYear = parts[0];
      initialMonth = parts[1];
    }
  }

  const [tempYear, setTempYear] = React.useState(initialYear);
  const [tempMonth, setTempMonth] = React.useState(initialMonth);

  // Sync temp states if model value changes programmatically
  React.useEffect(() => {
    if (value && typeof value === "string" && value.includes("-")) {
      const parts = value.split("-").map(Number);
      if (parts.length === 2) {
        setTempYear(parts[0]);
        setTempMonth(parts[1]);
      }
    }
  }, [value]);

  const confirmSelection = () => {
    question.value = `${tempYear}-${String(tempMonth).padStart(2, "0")}`;
    setShow(false);
  };

  const displayText = value ? value : (question.placeholder || "Select Month");

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
                  Select Month: {tempYear}-{String(tempMonth).padStart(2, "0")}
                </Text>
                <Pressable onPress={confirmSelection}>
                  <Text style={{ color: theme.colors.primary, fontWeight: "bold", fontSize: 16 }}>Done</Text>
                </Pressable>
              </View>

              <View style={styles.pickerBody}>
                {/* Years column */}
                <View style={[styles.yearsColumn, { borderRightColor: theme.colors.border }]}>
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
                            styles.yearItem,
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

                {/* Months grid column */}
                <View style={styles.monthsColumn}>
                  <View style={styles.monthsGrid}>
                    {MONTHS.map((m) => {
                      const isSelected = m.val === tempMonth;
                      return (
                        <Pressable
                          key={m.val}
                          onPress={() => setTempMonth(m.val)}
                          style={[
                            styles.monthButton,
                            {
                              backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                              borderRadius: theme.borderRadius.small
                            }
                          ]}
                        >
                          <Text style={{
                            color: isSelected ? "#ffffff" : theme.colors.text,
                            fontWeight: isSelected ? "bold" : "normal",
                            fontSize: 14
                          }}>
                            {m.text}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
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
  yearsColumn: {
    flex: 1.2,
    borderRightWidth: 1
  },
  monthsColumn: {
    flex: 2,
    padding: 10,
    justifyContent: "center"
  },
  yearItem: {
    height: 44,
    justifyContent: "center",
    alignItems: "center"
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between"
  },
  monthButton: {
    width: "30%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1
  }
});
