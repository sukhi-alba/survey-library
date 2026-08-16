import * as React from "react";
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from "react-native";
import { QuestionDropdownModel, ItemValue } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class DropdownQuestion extends ReactNativeSurveyElement<{ question: QuestionDropdownModel }, { modalVisible: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { modalVisible: false };
  }

  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  private selectValue(val: any) {
    const question = this.question;
    if (question.isInputReadOnly) return;
    question.value = val;
    this.setState({ modalVisible: false });
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const currentValue = question.value;

    const selectedChoice = question.visibleChoices.find((c: ItemValue) => c.value === currentValue);
    const displayText = selectedChoice ? (selectedChoice.text || selectedChoice.value) : (question.placeholder || "Select option");

    const modalItems = question.visibleChoices.map((choice: ItemValue) => {
      const isSelected = currentValue === choice.value;
      return (
        <Pressable
          key={choice.value}
          onPress={() => this.selectValue(choice.value)}
          style={({ pressed }) => [
            styles.modalItem,
            {
              backgroundColor: isSelected ? theme.colors.accent : pressed ? theme.colors.background : theme.colors.surface,
              borderBottomColor: theme.colors.border
            }
          ]}
        >
          <Text style={[styles.modalItemText, { color: theme.colors.text, fontWeight: isSelected ? "bold" : "normal" }]}>
            {choice.text || choice.value}
          </Text>
        </Pressable>
      );
    });

    return (
      <View>
        <Pressable
          onPress={() => !question.isInputReadOnly && this.setState({ modalVisible: true })}
          style={[
            styles.pickerButton,
            {
              borderColor: theme.colors.border,
              borderRadius: theme.borderRadius.small,
              backgroundColor: question.isInputReadOnly ? theme.colors.background : theme.colors.surface
            }
          ]}
        >
          <Text style={[styles.pickerButtonText, { color: selectedChoice ? theme.colors.text : theme.colors.placeholder }]}>
            {displayText}
          </Text>
          {!question.isInputReadOnly && <Text style={[styles.pickerArrow, { color: theme.colors.textLight }]}>▼</Text>}
        </Pressable>

        <Modal
          visible={this.state.modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => this.setState({ modalVisible: false })}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.large }]}>
              <Text style={[styles.modalHeader, { color: theme.colors.text }]}>
                {question.title || "Choose Option"}
              </Text>
              <ScrollView style={styles.modalScroll}>
                {modalItems}
              </ScrollView>
              <Pressable
                onPress={() => this.setState({ modalVisible: false })}
                style={[styles.closeButton, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.medium }]}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }
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
  pickerButtonText: {
    fontSize: 14
  },
  pickerArrow: {
    fontSize: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center"
  },
  modalScroll: {
    marginVertical: 8
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1
  },
  modalItemText: {
    fontSize: 15
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("dropdown", (props) => (
  <DropdownQuestion {...props} />
));
