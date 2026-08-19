import * as React from "react";
import { View, Text, Pressable, StyleSheet, Modal, Platform } from "react-native";
import DateTimePicker, { DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import { QuestionTextModel } from "survey-core";
import { getTheme } from "../../theme";
import { formatDate, formatTime, parseDateTime } from "../../utils/dateUtils";

interface DateTimePickerProps {
  question: QuestionTextModel;
}

export function DateTimePickerRenderer({ question }: DateTimePickerProps) {
  const theme = getTheme();
  const [activePicker, setActivePicker] = React.useState<null | "date" | "time">(null);
  const value = question.value; // expected: YYYY-MM-DDTHH:MM
  const date = parseDateTime(value);

  const onChange = (event: DateTimePickerChangeEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setActivePicker(null);
    }
    if (selectedDate) {
      // Split current date/time parts to update only the active picker portion
      const current = parseDateTime(question.value);
      if (activePicker === "date") {
        current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      } else if (activePicker === "time") {
        current.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      }

      const newYear = current.getFullYear();
      const newMonth = String(current.getMonth() + 1).padStart(2, "0");
      const newDay = String(current.getDate()).padStart(2, "0");
      const newHour = String(current.getHours()).padStart(2, "0");
      const newMin = String(current.getMinutes()).padStart(2, "0");

      question.value = `${newYear}-${newMonth}-${newDay}T${newHour}:${newMin}`;
    }
  };

  // Human-readable labels
  let dateText = "Select Date";
  let timeText = "Select Time";
  if (value && typeof value === "string" && value.includes("T")) {
    const parts = value.split("T");
    dateText = parts[0];
    timeText = parts[1];
  }

  const minDate = question.min ? parseDateTime(question.min) : undefined;
  const maxDate = question.max ? parseDateTime(question.max) : undefined;

  return (
    <View style={styles.container}>
      <Pressable
        disabled={question.isInputReadOnly}
        onPress={() => setActivePicker("date")}
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
          {dateText}
        </Text>
        {!question.isInputReadOnly && <Text style={{ color: theme.colors.textLight, fontSize: 14 }}>{"\uD83D\uDCC5"}</Text>}
      </Pressable>

      <Pressable
        disabled={question.isInputReadOnly}
        onPress={() => setActivePicker("time")}
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
          {timeText}
        </Text>
        {!question.isInputReadOnly && <Text style={{ color: theme.colors.textLight, fontSize: 14 }}>{"\uD83D\uDD52"}</Text>}
      </Pressable>

      {activePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode={activePicker}
          is24Hour={true}
          display="default"
          onChange={onChange}
          minimumDate={activePicker === "date" ? minDate : undefined}
          maximumDate={activePicker === "date" ? maxDate : undefined}
        />
      )}

      {activePicker && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={!!activePicker}
          onRequestClose={() => setActivePicker(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.headerRow, { borderBottomColor: theme.colors.border }]}>
                <Pressable onPress={() => setActivePicker(null)}>
                  <Text style={{ color: theme.colors.primary, fontWeight: "bold", fontSize: 16 }}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={date}
                mode={activePicker}
                is24Hour={true}
                display="spinner"
                onChange={onChange}
                textColor={theme.colors.text}
                minimumDate={activePicker === "date" ? minDate : undefined}
                maximumDate={activePicker === "date" ? maxDate : undefined}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
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
    paddingBottom: 20
  },
  headerRow: {
    height: 48,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1
  }
});
