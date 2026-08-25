/**
 * RatingQuestion Component
 * Renders a row of selectable options (numbers or custom values) for rating.
 */
import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { QuestionRatingModel, ItemValue } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class RatingQuestion extends ReactNativeSurveyElement<{ question: QuestionRatingModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const currentValue = question.value;
    const isReadOnly = question.isInputReadOnly;

    /**
     * visibleRateValues is a computed array on QuestionRatingModel that returns
     * either the custom rateValues (if set) or an auto-generated range from
     * rateMin to rateMax by rateStep - each element is an ItemValue.
     */
    const rateValues: ItemValue[] = question.visibleRateValues || [];

    return (
      <View style={styles.container}>
        {rateValues.map((rate: ItemValue) => {
          const isSelected =
            currentValue == rate.value ||
            (currentValue !== undefined && String(currentValue) === String(rate.value));
          return (
            <Pressable
              key={String(rate.value)}
              disabled={isReadOnly}
              onPress={() => {
                question.value = rate.value;
              }}
              style={[
                styles.ratingItem,
                {
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
                  borderRadius: theme.borderRadius.small,
                  opacity: isReadOnly ? 0.6 : 1,
                },
              ]}
              accessibilityRole="radio"
              accessibilityLabel={String(rate.text || rate.value)}
              accessibilityState={{ checked: isSelected, disabled: isReadOnly }}
            >
              <Text
                style={[
                  styles.ratingText,
                  { color: isSelected ? theme.colors.primary : theme.colors.text },
                ]}
              >
                {rate.text || String(rate.value)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
  },
  ratingItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("rating", (props) => (
  <RatingQuestion {...props} />
));
