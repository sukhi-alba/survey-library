/**
 * BooleanQuestion Component
 * Renders a standard boolean question (Switch with true/false labels).
 */
import * as React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { QuestionBooleanModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class BooleanQuestion extends ReactNativeSurveyElement<{ question: QuestionBooleanModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const isTrue = question.booleanValue === true;
    const isReadOnly = question.isInputReadOnly;

    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.label,
            {
              color: question.booleanValue === false ? theme.colors.primary : theme.colors.textLight,
            },
          ]}
        >
          {question.labelFalse || "No"}
        </Text>
        <Switch
          disabled={isReadOnly}
          value={isTrue}
          onValueChange={(newValue) => {
            question.booleanValue = newValue;
          }}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
          accessibilityRole="switch"
          accessibilityLabel={question.title}
          accessibilityState={{ checked: isTrue, disabled: isReadOnly }}
        />
        <Text
          style={[
            styles.label,
            {
              color: isTrue ? theme.colors.primary : theme.colors.textLight,
            },
          ]}
        >
          {question.labelTrue || "Yes"}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("boolean", (props) => (
  <BooleanQuestion {...props} />
));
