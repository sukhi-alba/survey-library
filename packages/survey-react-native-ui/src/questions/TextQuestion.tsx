import * as React from "react";
import { TextInput, StyleSheet } from "react-native";
import { QuestionTextModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class TextQuestion extends ReactNativeSurveyElement<{ question: QuestionTextModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }
  render() {
    const theme = getTheme();
    const question = this.question;

    let keyboardType: any = "default";
    if (question.inputType === "numeric" || question.inputType === "number" || question.inputType === "range") {
      keyboardType = "numeric";
    } else if (question.inputType === "tel") {
      keyboardType = "phone-pad";
    } else if (question.inputType === "email") {
      keyboardType = "email-address";
    }

    const secureTextEntry = question.inputType === "password";

    return (
      <TextInput
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            color: theme.colors.text,
            borderRadius: theme.borderRadius.small,
            backgroundColor: question.isInputReadOnly ? theme.colors.background : theme.colors.surface
          }
        ]}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={!question.isInputReadOnly}
        value={question.value !== undefined ? String(question.value) : ""}
        onChangeText={(text) => {
          question.value = text;
        }}
        placeholder={question.placeholder}
        placeholderTextColor={theme.colors.placeholder}
      />
    );
  }
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
    minHeight: 40
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("text", (props) => (
  <TextQuestion {...props} />
));
