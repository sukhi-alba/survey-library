import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  QuestionMatrixDropdownModelBase,
  QuestionMatrixDropdownRenderedRow,
  QuestionMatrixDropdownRenderedCell,
} from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { SurveyElementErrors } from "../Survey";
import { getTheme } from "../theme";

export class MatrixDropdownQuestion extends ReactNativeSurveyElement<{
  question: QuestionMatrixDropdownModelBase,
  services?: any,
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
    const table = question.renderedTable;
    if (!table) return null;

    /**
     * renderedRows alternates between null-separator rows (row.row === null)
     * and actual data rows (row.row !== null). We must filter out the null
     * separator rows before rendering, otherwise we crash on null access.
     */
    const dataRows = (table.renderedRows || []).filter(
      (row: QuestionMatrixDropdownRenderedRow) => row.row !== null && row.row !== undefined
    );

    if (dataRows.length === 0) {
      return (
        <Text style={{ color: theme.colors.placeholder }}>No rows defined</Text>
      );
    }

    return (
      <View style={styles.container}>
        {dataRows.map((row: QuestionMatrixDropdownRenderedRow) => {
          /*
           * MatrixDropdownRowModelBase has .text (display text) and .value (key).
           * row.row.text is the correct property - NOT row.row.rowName (which does not exist).
           */
          const rowLabel = row.row?.text || String(row.row?.value ?? row.id);

          return (
            <View
              key={row.id}
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
                {rowLabel}
              </Text>

              <View style={styles.cellsList}>
                {row.cells.map((cell: QuestionMatrixDropdownRenderedCell) => {
                  if (!cell.isVisible || !cell.hasQuestion) return null;

                  const cellQuestion = cell.question;
                  const cellType = cellQuestion.isDefaultRendering()
                    ? cellQuestion.getTemplate()
                    : cellQuestion.getComponentName();
                  const cellBody = ReactNativeQuestionFactory.Instance.createQuestion(cellType, {
                    question: cellQuestion,
                    services: this.props.services,
                  });

                  const cellErrors =
                    cellQuestion.errors && cellQuestion.errors.length > 0 ? (
                      <SurveyElementErrors errors={cellQuestion.errors} />
                    ) : null;

                  return (
                    <View key={cell.id} style={styles.cellContainer}>
                      <Text style={[styles.cellLabel, { color: theme.colors.textLight }]}>
                        {cell.column?.title || cell.column?.name || ""}
                      </Text>
                      <View style={styles.cellBody}>
                        {cellBody || (
                          <Text style={{ color: theme.colors.error }}>
                            Unsupported cell type: {cellType}
                          </Text>
                        )}
                      </View>
                      {cellErrors}
                    </View>
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
    gap: 16,
  },
  rowCard: {
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cellsList: {
    gap: 12,
  },
  cellContainer: {
    gap: 4,
  },
  cellLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  cellBody: {
    minHeight: 40,
    justifyContent: "center",
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("matrixdropdown", (props) => (
  <MatrixDropdownQuestion {...props} />
));
