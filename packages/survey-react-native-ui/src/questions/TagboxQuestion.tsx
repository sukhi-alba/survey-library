/**
 * TagboxQuestion Component
 * Renders a multi-select dropdown question represented by visual tags.
 */
import * as React from "react";
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from "react-native";
import { QuestionTagboxModel, ItemValue } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

interface TagboxState {
  modalVisible: boolean;
}

export class TagboxQuestion extends ReactNativeSurveyElement<
  { question: QuestionTagboxModel },
  TagboxState
> {
  constructor(props: { question: QuestionTagboxModel }) {
    super(props);
    this.state = { modalVisible: false };
  }

  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  private get selectedValues(): any[] {
    const val = this.question.value;
    return Array.isArray(val) ? val : [];
  }

  private toggleItem(val: any) {
    const question = this.question;
    if (question.isInputReadOnly) return;

    const current = [...this.selectedValues];
    const idx = current.findIndex((v) => v == val || String(v) === String(val));
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(val);
    }
    question.value = current.length > 0 ? current : undefined;
  }

  private removeChip(val: any) {
    const question = this.question;
    if (question.isInputReadOnly) return;
    const current = this.selectedValues.filter((v) => v != val && String(v) !== String(val));
    question.value = current.length > 0 ? current : undefined;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const isReadOnly = question.isInputReadOnly;
    const selected = this.selectedValues;
    const choices: ItemValue[] = question.visibleChoices || [];

    // Map selected values to their display text
    const choiceMap = new Map<any, string>();
    choices.forEach((c: ItemValue) => choiceMap.set(c.value, c.text || String(c.value)));

    return (
      <View>
        {/* Chip display area */}
        <Pressable
          onPress={() => !isReadOnly && this.setState({ modalVisible: true })}
          style={[
            styles.chipContainer,
            {
              borderColor: theme.colors.border,
              borderRadius: theme.borderRadius.small,
              backgroundColor: isReadOnly ? theme.colors.background : theme.colors.surface,
              minHeight: 44,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={question.title + ", " + (selected.length > 0 ? selected.length + " selected" : "tap to select")}
        >
          <View style={styles.chipsRow}>
            {selected.length === 0 && (
              <Text style={{ color: theme.colors.placeholder, fontSize: 14 }}>
                {question.placeholder || "Select options\u2026"}
              </Text>
            )}
            {selected.map((val) => (
              <View
                key={String(val)}
                style={[
                  styles.chip,
                  { backgroundColor: theme.colors.accent, borderColor: theme.colors.primary },
                ]}
              >
                <Text style={[styles.chipText, { color: theme.colors.primary }]}>
                  {choiceMap.get(val) || String(val)}
                </Text>
                {!isReadOnly && (
                  <Pressable
                    onPress={() => this.removeChip(val)}
                    style={styles.chipRemove}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${choiceMap.get(val) || val}`}
                  >
                    <Text style={[styles.chipRemoveText, { color: theme.colors.primary }]}>
                      {"\u00D7"}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
            {!isReadOnly && (
              <Text style={[styles.dropdownArrow, { color: theme.colors.textLight }]}>
                {"\u25BE"}
              </Text>
            )}
          </View>
        </Pressable>

        {/* Selection modal */}
        <Modal
          visible={this.state.modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => this.setState({ modalVisible: false })}
          >
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.large,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {question.title || "Select Options"}
              </Text>

              <ScrollView style={styles.modalScroll} bounces={false}>
                {choices.map((choice: ItemValue) => {
                  const isChosen = selected.some(
                    (v) => v == choice.value || String(v) === String(choice.value)
                  );
                  return (
                    <Pressable
                      key={String(choice.value)}
                      onPress={() => this.toggleItem(choice.value)}
                      style={({ pressed }) => [
                        styles.modalItem,
                        {
                          backgroundColor: isChosen
                            ? theme.colors.accent
                            : pressed ? theme.colors.background : theme.colors.surface,
                          borderBottomColor: theme.colors.border,
                        },
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isChosen }}
                      accessibilityLabel={choice.text || String(choice.value)}
                    >
                      <View
                        style={[
                          styles.checkBox,
                          {
                            borderColor: isChosen ? theme.colors.primary : theme.colors.border,
                            backgroundColor: isChosen ? theme.colors.primary : "transparent",
                          },
                        ]}
                      >
                        {isChosen && (
                          <Text style={styles.checkMark}>{"\u2713"}</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.modalItemText,
                          { color: theme.colors.text, fontWeight: isChosen ? "600" : "normal" },
                        ]}
                      >
                        {choice.text || String(choice.value)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable
                onPress={() => this.setState({ modalVisible: false })}
                style={[
                  styles.doneButton,
                  { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.medium },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Done"
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  chipContainer: {
    borderWidth: 1,
    padding: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
    minHeight: 28,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  chipRemove: {
    marginLeft: 2,
  },
  chipRemoveText: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 18,
  },
  dropdownArrow: {
    fontSize: 14,
    marginLeft: "auto",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxHeight: "75%",
    padding: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
  },
  modalScroll: {
    marginBottom: 12,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalItemText: {
    fontSize: 15,
    flex: 1,
  },
  doneButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("tagbox", (props) => (
  <TagboxQuestion {...props} />
));
