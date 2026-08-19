import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { QuestionMatrixModel, MatrixRowModel, ItemValue } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class MatrixQuestion extends ReactNativeSurveyElement<{ question: QuestionMatrixModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const rows = question.visibleRows || [];
    const columns = question.visibleColumns || [];

    return (
      <View style={styles.container}>
        {rows.map((row: MatrixRowModel) => {
          const rowValue = row.value;
          return (
            <View
              key={row.uniqueId || row.name}
              style={[
                styles.rowCard,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.medium
                }
              ]}
            >
              <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
                {row.text || row.name}
              </Text>

              <View style={styles.choicesList}>
                {columns.map((column: ItemValue) => {
                  const isSelected = rowValue === column.value;
                  return (
                    <Pressable
                      key={column.value}
                      disabled={question.isInputReadOnly}
                      onPress={() => {
                        if (!question.isInputReadOnly) {
                          row.value = column.value;
                          this.forceUpdate();
                        }
                      }}
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
                        {column.text || column.value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  rowCard: {
    borderWidth: 1,
    padding: 12,
    gap: 8
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "bold"
  },
  choicesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  choiceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingRight: 8
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6
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

ReactNativeQuestionFactory.Instance.registerQuestion("matrix", (props) => (
  <MatrixQuestion {...props} />
));
