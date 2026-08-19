import * as React from "react";
import { TextInput, StyleSheet } from "react-native";
import { QuestionTextModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

// Import specialized renderers
import { DatePickerRenderer } from "./TextInputs/DatePickerRenderer";
import { TimePickerRenderer } from "./TextInputs/TimePickerRenderer";
import { DateTimePickerRenderer } from "./TextInputs/DateTimePickerRenderer";
import { MonthPickerRenderer } from "./TextInputs/MonthPickerRenderer";
import { WeekPickerRenderer } from "./TextInputs/WeekPickerRenderer";
import { RangePickerRenderer } from "./TextInputs/RangePickerRenderer";
import { ColorPickerRenderer } from "./TextInputs/ColorPickerRenderer";

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
    const inputType = question.inputType;

    // Dispatch to specialized pickers
    if (inputType === "date") {
      return <DatePickerRenderer question={question} />;
    }
    if (inputType === "time") {
      return <TimePickerRenderer question={question} />;
    }
    if (inputType === "datetime-local") {
      return <DateTimePickerRenderer question={question} />;
    }
    if (inputType === "month") {
      return <MonthPickerRenderer question={question} />;
    }
    if (inputType === "week") {
      return <WeekPickerRenderer question={question} />;
    }
    if (inputType === "range") {
      return <RangePickerRenderer question={question} />;
    }
    if (inputType === "color") {
      return <ColorPickerRenderer question={question} />;
    }

    let keyboardType: any = "default";
    if (question.inputType === "numeric" || question.inputType === "number") {
      keyboardType = "numeric";
    } else if (question.inputType === "tel") {
      keyboardType = "phone-pad";
    } else if (question.inputType === "email") {
      keyboardType = "email-address";
    } else if (inputType === "url") {
      keyboardType = "url";
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
