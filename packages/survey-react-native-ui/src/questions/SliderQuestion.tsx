import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { QuestionSliderModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class SliderQuestion extends ReactNativeSurveyElement<{ question: QuestionSliderModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const isReadOnly = question.isInputReadOnly;

    const min = question.min !== undefined ? Number(question.min) : 0;
    const max = question.max !== undefined ? Number(question.max) : 100;
    const step = question.step !== undefined ? Number(question.step) : 1;
    const value = question.value !== undefined ? Number(question.value) : min;

    return (
      <View style={styles.container}>
        <View style={styles.valueRow}>
          <Text style={[styles.limitText, { color: theme.colors.textLight }]}>{min}</Text>
          <Text style={[styles.currentValue, { color: theme.colors.primary }]}>{value}</Text>
          <Text style={[styles.limitText, { color: theme.colors.textLight }]}>{max}</Text>
        </View>
        <Slider
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          disabled={isReadOnly}
          onValueChange={(val: number) => {
            question.value = val;
          }}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={isReadOnly ? theme.colors.textLight : theme.colors.primary}
          style={styles.slider}
          accessibilityLabel={question.title}
          accessibilityRole="adjustable"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    width: "100%",
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  limitText: {
    fontSize: 12,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("slider", (props) => (
  <SliderQuestion {...props} />
));
