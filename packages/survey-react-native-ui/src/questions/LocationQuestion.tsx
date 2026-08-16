import * as React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { QuestionCustomModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class LocationQuestion extends ReactNativeSurveyElement<{ question: QuestionCustomModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  private updateCoordinate(key: "latitude" | "longitude", text: string) {
    const question = this.question;
    if (question.isInputReadOnly) return;

    const numVal = parseFloat(text) || 0;
    // Update custom properties on the model instance if they exist
    if (key in question) {
      (question as any)[key] = numVal;
    }

    // Update the question value (serialized payload)
    const currentValue = question.value || { latitude: 0, longitude: 0 };
    const newValue = {
      ...currentValue,
      [key]: numVal
    };

    question.value = newValue;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const isReadOnly = question.isInputReadOnly;

    // Retrieve coordinates from either question value object or properties
    const value = question.value || {};
    const latitude = value.latitude !== undefined ? value.latitude : ((question as any).latitude || 0);
    const longitude = value.longitude !== undefined ? value.longitude : ((question as any).longitude || 0);

    return (
      <View style={[styles.container, { borderColor: theme.colors.border, borderRadius: theme.borderRadius.medium }]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textLight }]}>Latitude</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.small,
                backgroundColor: isReadOnly ? theme.colors.background : theme.colors.surface
              }
            ]}
            keyboardType="numeric"
            editable={!isReadOnly}
            value={String(latitude)}
            onChangeText={(text) => this.updateCoordinate("latitude", text)}
            placeholder="0.0000"
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textLight }]}>Longitude</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.small,
                backgroundColor: isReadOnly ? theme.colors.background : theme.colors.surface
              }
            ]}
            keyboardType="numeric"
            editable={!isReadOnly}
            value={String(longitude)}
            onChangeText={(text) => this.updateCoordinate("longitude", text)}
            placeholder="0.0000"
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 12,
    gap: 12,
    borderStyle: "dashed"
  },
  inputGroup: {
    gap: 4
  },
  label: {
    fontSize: 12,
    fontWeight: "bold"
  },
  input: {
    borderWidth: 1,
    padding: 8,
    fontSize: 14,
    height: 40
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("location", (props) => (
  <LocationQuestion {...props} />
));
