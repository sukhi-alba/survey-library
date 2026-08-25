import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { QuestionMatrixModel, MatrixRowModel, ItemValue, Base } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class MatrixQuestion extends ReactNativeSurveyElement<{ question: QuestionMatrixModel }> {
  protected getStateElement() {
    return this.props.question;
  }

  /**
   * Subscribe to the question AND each visible row so that when row.value
   * changes (user taps a column), the component re-renders automatically.
   * This replaces the forceUpdate() hack that was used before.
   */
  protected getStateElements(): Array<Base> {
    const elements: Array<Base> = [];
    const q = this.props.question;
    if (q) {
      elements.push(q);
      const rows: MatrixRowModel[] = q.visibleRows || [];
      rows.forEach((row) => elements.push(row));
    }
    return elements;
  }

  get question() {
    return this.props.question;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const rows: MatrixRowModel[] = question.visibleRows || [];
    const columns: ItemValue[] = question.visibleColumns || [];

    if (rows.length === 0) {
      return (
        <Text style={{ color: theme.colors.placeholder }}>No rows defined</Text>
      );
    }

    return (
      <View style={styles.container}>
        {rows.map((row: MatrixRowModel) => {
          const rowValue = row.value;
          return (
            <View
              key={row.name}
              style={[
                styles.rowCard,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.medium,
                },
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
                      key={String(column.value)}
                      disabled={question.isInputReadOnly}
                      onPress={() => {
                        if (!question.isInputReadOnly) {
                          row.value = column.value;
                        }
                      }}
                      style={styles.choiceItem}
                      accessibilityRole="radio"
                      accessibilityLabel={`${row.text || row.name}: ${column.text || String(column.value)}`}
                      accessibilityState={{ checked: isSelected, disabled: question.isInputReadOnly }}
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          {
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          },
                        ]}
                      >
                        {isSelected && (
                          <View
                            style={[styles.radioInner, { backgroundColor: theme.colors.primary }]}
                          />
                        )}
                      </View>
                      <Text style={[styles.choiceText, { color: theme.colors.text }]}>
                        {column.text || String(column.value)}
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
    gap: 12,
  },
  rowCard: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  choicesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  choiceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingRight: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  choiceText: {
    fontSize: 14,
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("matrix", (props) => (
  <MatrixQuestion {...props} />
));
