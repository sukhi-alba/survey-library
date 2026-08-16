import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { QuestionRadiogroupModel, ItemValue } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class RadioQuestion extends ReactNativeSurveyElement<{ question: QuestionRadiogroupModel }> {
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
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const currentValue = question.value;

    const choices = question.visibleChoices.map((choice: ItemValue) => {
      const isSelected = currentValue === choice.value;
      return (
        <Pressable
          key={choice.value}
          onPress={() => this.selectValue(choice.value)}
          disabled={question.isInputReadOnly}
          style={styles.choiceItem}
        >
          <View
            style={[
              styles.radioOuter,
              {
                borderColor: theme.colors.border,
                backgroundColor: "transparent"
              }
            ]}
          >
            {isSelected && (
              <View
                style={[
                  styles.radioInner,
                  {
                    backgroundColor: theme.colors.primary
                  }
                ]}
              />
            )}
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
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  choiceText: {
    fontSize: 14
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("radiogroup", (props) => (
  <RadioQuestion {...props} />
));
