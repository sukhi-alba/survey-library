import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { QuestionExpressionModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class ExpressionQuestion extends ReactNativeSurveyElement<{ question: QuestionExpressionModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }
  render() {
    const theme = getTheme();
    const question = this.question;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.small
          }
        ]}
      >
        <Text style={[styles.text, { color: theme.colors.text }]}>
          {question.formatedValue || ""}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center"
  },
  text: {
    fontSize: 14,
    fontWeight: "500"
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("expression", (props) => (
  <ExpressionQuestion {...props} />
));
