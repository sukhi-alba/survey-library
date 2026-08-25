import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  QuestionMatrixDynamicModel,
  QuestionMatrixDropdownRenderedRow,
  QuestionMatrixDropdownRenderedCell,
} from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { SurveyElementErrors } from "../Survey";
import { getTheme } from "../theme";

export class MatrixDynamicQuestion extends ReactNativeSurveyElement<{
  question: QuestionMatrixDynamicModel,
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

    const canAdd = question.canAddRow;
    const canRemove = question.canRemoveRows;

    /**
     * renderedRows alternates between null-separator rows (row.row === null)
     * and actual data rows (row.row !== null). Filter to data rows only.
     * The model row index equals the position among data rows only - used
     * for question.removeRow(modelIndex).
     */
    const dataRows = (table.renderedRows || []).filter(
      (row: QuestionMatrixDropdownRenderedRow) => row.row !== null && row.row !== undefined
    );

    return (
      <View style={styles.container}>
        {dataRows.map((row: QuestionMatrixDropdownRenderedRow, modelIndex: number) => {
          const rowLabel = row.row?.text || `Row ${modelIndex + 1}`;

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
              <View style={styles.rowHeader}>
                <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
                  {rowLabel}
                </Text>
                {canRemove && (
                  <Pressable
                    onPress={() => {
                      /**
                       * question.removeRow takes the 0-based model row index,
                       * which equals the data-row index (null separator rows excluded).
                       */
                      question.removeRow(modelIndex);
                    }}
                    style={[styles.removeButton, { borderColor: theme.colors.error }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${rowLabel}`}
                  >
                    <Text style={[styles.removeButtonText, { color: theme.colors.error }]}>
                      Remove
                    </Text>
                  </Pressable>
                )}
              </View>

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

        {canAdd && (
          <Pressable
            onPress={() => {
              question.addRowUI();
            }}
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.medium },
            ]}
            accessibilityRole="button"
            accessibilityLabel={question.addRowText || "Add Row"}
          >
            <Text style={styles.addButtonText}>
              {question.addRowText || "Add Row"}
            </Text>
          </Pressable>
        )}
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
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 8,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  removeButton: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 12,
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
  addButton: {
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("matrixdynamic", (props) => (
  <MatrixDynamicQuestion {...props} />
));
