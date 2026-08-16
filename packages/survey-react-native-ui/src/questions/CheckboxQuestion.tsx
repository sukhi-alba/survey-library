import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { QuestionCheckboxModel, ItemValue } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class CheckboxQuestion extends ReactNativeSurveyElement<{ question: QuestionCheckboxModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  private toggleValue(val: any) {
    const question = this.question;
    if (question.isInputReadOnly) return;

    let currentVal = Array.isArray(question.value) ? [...question.value] : [];
    const index = currentVal.indexOf(val);
    if (index > -1) {
      currentVal.splice(index, 1);
    } else {
      currentVal.push(val);
    }
    question.value = currentVal;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const currentValues = Array.isArray(question.value) ? question.value : [];

    const choices = question.visibleChoices.map((choice: ItemValue) => {
      const isSelected = currentValues.indexOf(choice.value) > -1;
      return (
        <Pressable
          key={choice.value}
          onPress={() => this.toggleValue(choice.value)}
          disabled={question.isInputReadOnly}
          style={styles.choiceItem}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.small,
                backgroundColor: isSelected ? theme.colors.primary : "transparent"
              }
            ]}
          >
            {isSelected && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={[styles.choiceText, { color: theme.colors.text }]}>
            {choice.text || choice.value}
          </Text>
        </Pressable>
      );
    });

    return <View style={styles.container}>{choices}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  choiceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  checkMark: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold"
  },
  choiceText: {
    fontSize: 14
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("checkbox", (props) => (
  <CheckboxQuestion {...props} />
));
