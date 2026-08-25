import * as React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { QuestionMultipleTextModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

/**
 * Duck-type interface for MultipleTextItemModel.
 *
 * survey-core does not export MultipleTextItemModel directly in its public API.
 * We define the minimal interface that matches the observable properties.
 * Key behavior: setting `item.value = x` writes into `question.value[item.name]`
 * and fires a property-change event on the parent question, triggering re-render.
 */
interface IMultipleTextItem {
  readonly name: string;
  readonly title: string;
  value: string | undefined | null;
  readonly placeholder: string;
  readonly isRequired: boolean;
  readonly isInputReadOnly: boolean;
  readonly inputType: string;
}

export class MultipleTextQuestion extends ReactNativeSurveyElement<{
  question: QuestionMultipleTextModel,
}> {
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
    const items = question.items as unknown as IMultipleTextItem[];

    if (!items || items.length === 0) {
      return (
        <Text style={{ color: theme.colors.placeholder }}>No items defined</Text>
      );
    }

    return (
      <View style={styles.container}>
        {items.map((item: IMultipleTextItem) => {
          /**
           * item.value is a getter/setter on MultipleTextItemModel that reads
           * from and writes to question.value[item.name]. When item.value is
           * set, survey-core fires question.onPropertyValueChanged, which
           * ReactNativeSurveyElement picks up and triggers a re-render.
           */
          const currentVal =
            item.value !== null && item.value !== undefined
              ? String(item.value)
              : "";

          const itemReadOnly = isReadOnly || item.isInputReadOnly;

          return (
            <View key={item.name} style={styles.itemRow}>
              <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                {item.title || item.name}
                {item.isRequired ? (
                  <Text style={{ color: theme.colors.error }}> *</Text>
                ) : null}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                    borderRadius: theme.borderRadius.small,
                    backgroundColor: itemReadOnly
                      ? theme.colors.background
                      : theme.colors.surface,
                  },
                ]}
                value={currentVal}
                editable={!itemReadOnly}
                onChangeText={(text) => {
                  // Write through to survey-core's value object.
                  // The empty string is stored as-is (SurveyJS distinguishes
                  // empty string from undefined in some validators).
                  item.value = text;
                }}
                placeholder={item.placeholder || ""}
                placeholderTextColor={theme.colors.placeholder}
                keyboardType={
                  item.inputType === "number" || item.inputType === "numeric"
                    ? "numeric"
                    : item.inputType === "email" ? "email-address" : item.inputType === "tel" ? "phone-pad" : "default"
                }
                secureTextEntry={item.inputType === "password"}
                accessibilityLabel={item.title || item.name}
              />
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  itemRow: {
    gap: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
    minHeight: 40,
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("multipletext", (props) => (
  <MultipleTextQuestion {...props} />
));
ReactNativeQuestionFactory.Instance.registerQuestion("multipletextboxes", (props) => (
  <MultipleTextQuestion {...props} />
));
