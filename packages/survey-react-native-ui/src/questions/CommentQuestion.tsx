import * as React from "react";
import { TextInput, StyleSheet } from "react-native";
import { QuestionCommentModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class CommentQuestion extends ReactNativeSurveyElement<{ question: QuestionCommentModel }> {
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
        multiline={true}
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
    minHeight: 80,
    textAlignVertical: "top"
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("comment", (props) => (
  <CommentQuestion {...props} />
));
