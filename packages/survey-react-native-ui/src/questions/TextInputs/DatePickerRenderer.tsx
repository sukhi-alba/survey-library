import * as React from "react";
import { View, Text, Pressable, StyleSheet, Modal, Platform } from "react-native";
import DateTimePicker, { DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import { QuestionTextModel } from "survey-core";
import { getTheme } from "../../theme";
import { formatDate, parseDate } from "../../utils/dateUtils";

interface DatePickerProps {
  question: QuestionTextModel;
}

export function DatePickerRenderer({ question }: DatePickerProps) {
  const theme = getTheme();
  const [show, setShow] = React.useState(false);
  const value = question.value;
  const date = parseDate(value);

  const onChange = (event: DateTimePickerChangeEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedDate) {
      question.value = formatDate(selectedDate);
    }
  };

  const displayText = value ? value : (question.placeholder || "Select Date");

  const minDate = question.min ? parseDate(question.min) : undefined;
  const maxDate = question.max ? parseDate(question.max) : undefined;

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

      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}

      {show && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={show}
          onRequestClose={() => setShow(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShow(false)}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.headerRow, { borderBottomColor: theme.colors.border }]}>
                <Pressable onPress={() => setShow(false)}>
                  <Text style={{ color: theme.colors.primary, fontWeight: "bold", fontSize: 16 }}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onChange}
                textColor={theme.colors.text}
                minimumDate={minDate}
                maximumDate={maxDate}
              />
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
