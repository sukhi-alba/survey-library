/**
 * RankingQuestion Component
 * Renders a list of items that can be ranked by moving them up/down.
 */
import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { QuestionRankingModel, ItemValue } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class RankingQuestion extends ReactNativeSurveyElement<{ question: QuestionRankingModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  /**
   * Returns the current ordered list of choice values.
   * When question.value is empty ([]) - unranked state - we use the
   * visibleChoices order as the initial display order. This matches
   * a natural UX where items appear in their original order before
   * the user starts ranking.
   */
  private getCurrentOrder(): any[] {
    const question = this.question;
    const val: any[] = Array.isArray(question.value) ? question.value : [];
    if (val.length > 0) return val;
    return question.visibleChoices.map((c: ItemValue) => c.value);
  }

  private moveItem(index: number, direction: "up" | "down") {
    const question = this.question;
    if (question.isInputReadOnly) return;

    const currentOrder = this.getCurrentOrder();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const updated = [...currentOrder];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    question.value = updated;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const isReadOnly = question.isInputReadOnly;
    const currentOrder = this.getCurrentOrder();

    /**
     * Build sorted choices array: choices in current ranked order.
     * Unranked choices (not in value) appear at the end in original order.
     */
    const choiceMap = new Map<any, ItemValue>();
    question.visibleChoices.forEach((c: ItemValue) => choiceMap.set(c.value, c));

    const sortedChoices: ItemValue[] = currentOrder
      .map((v) => choiceMap.get(v))
      .filter((c): c is ItemValue => c !== undefined);

    return (
      <View style={styles.container}>
        {sortedChoices.map((choice: ItemValue, index: number) => (
          <View
            key={String(choice.value)}
            style={[
              styles.rankingRow,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.small,
              },
            ]}
          >
            <View style={styles.rankInfo}>
              <Text style={[styles.rankIndex, { color: theme.colors.primary }]}>
                {index + 1}
              </Text>
              <Text style={[styles.rankLabel, { color: theme.colors.text }]}>
                {choice.text || String(choice.value)}
              </Text>
            </View>

            {!isReadOnly && (
              <View style={styles.rankButtons}>
                <Pressable
                  disabled={index === 0}
                  onPress={() => this.moveItem(index, "up")}
                  style={[
                    styles.rankButton,
                    { backgroundColor: theme.colors.accent },
                    index === 0 && styles.rankButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${choice.text || choice.value} up`}
                  accessibilityState={{ disabled: index === 0 }}
                >
                  <Text
                    style={[
                      styles.rankButtonText,
                      { color: index === 0 ? theme.colors.textLight : theme.colors.primary },
                    ]}
                  >
                    {"\u25B2"}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={index === sortedChoices.length - 1}
                  onPress={() => this.moveItem(index, "down")}
                  style={[
                    styles.rankButton,
                    { backgroundColor: theme.colors.accent },
                    index === sortedChoices.length - 1 && styles.rankButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${choice.text || choice.value} down`}
                  accessibilityState={{ disabled: index === sortedChoices.length - 1 }}
                >
                  <Text
                    style={[
                      styles.rankButtonText,
                      {
                        color:
                          index === sortedChoices.length - 1
                            ? theme.colors.textLight
                            : theme.colors.primary,
                      },
                    ]}
                  >
                    {"\u25BC"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 4,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
  },
  rankInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  rankIndex: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 24,
    textAlign: "center",
  },
  rankLabel: {
    fontSize: 14,
    flex: 1,
  },
  rankButtons: {
    flexDirection: "row",
    gap: 6,
  },
  rankButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  rankButtonDisabled: {
    opacity: 0.4,
  },
  rankButtonText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("ranking", (props) => (
  <RankingQuestion {...props} />
));
