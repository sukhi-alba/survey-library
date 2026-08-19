import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { QuestionPanelDynamicModel, PanelModel, Base } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { SurveyPanel } from "../Survey";
import { getTheme } from "../theme";

export class PanelDynamicQuestion extends ReactNativeSurveyElement<{ question: QuestionPanelDynamicModel, services?: any }, { panelCounter: number }> {
  constructor(props: any) {
    super(props);
    this.state = { panelCounter: 0 };
  }

  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  componentDidMount() {
    super.componentDidMount();
    const self = this;
    this.question.panelCountChangedCallback = () => {
      self.updateQuestionRendering();
    };
    this.question.currentIndexChangedCallback = () => {
      self.updateQuestionRendering();
    };
    this.question.renderModeChangedCallback = () => {
      self.updateQuestionRendering();
    };
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.question.panelCountChangedCallback = () => {};
    this.question.currentIndexChangedCallback = () => {};
    this.question.renderModeChangedCallback = () => {};
  }

  private updateQuestionRendering() {
    this.setState((prev) => ({
      panelCounter: prev.panelCounter + 1
    }));
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const cssClasses = question.cssClasses;

    if (question.getShowNoEntriesPlaceholder()) {
      return (
        <View style={[styles.placeholderCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.borderRadius.medium }]}>
          <Text style={[styles.placeholderText, { color: theme.colors.textLight }]}>
            {this.renderLocString(question.locNoEntriesText)}
          </Text>
          {question.canAddPanel && (
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.medium }]}
              onPress={() => question.addPanel()}
            >
              <Text style={styles.buttonText}>
                {this.renderLocString(question.locAddPanelText) || "Add New"}
              </Text>
            </Pressable>
          )}
        </View>
      );
    }

    const renderedPanels = question.renderedPanels;

    if (question.isRenderModeList) {
      // List Mode - Render all panels
      const panels = renderedPanels.map((panel: PanelModel, index: number) => {
        return (
          <View key={panel.id} style={styles.panelWrapper}>
            <View style={styles.panelHeaderRow}>
              <Text style={[styles.panelNumberText, { color: theme.colors.textLight }]}>
                #{index + 1}
              </Text>
              {question.canRemovePanel && (
                <Pressable
                  style={[styles.removeButton, { borderColor: theme.colors.error, borderRadius: theme.borderRadius.small }]}
                  onPress={() => question.removePanel(panel)}
                >
                  <Text style={[styles.removeButtonText, { color: theme.colors.error }]}>
                    Remove
                  </Text>
                </Pressable>
              )}
            </View>
            <SurveyPanel element={panel} services={this.props.services} />
          </View>
        );
      });

      return (
        <View style={styles.container}>
          {panels}
          {question.canAddPanel && (
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.medium }]}
              onPress={() => question.addPanel()}
            >
              <Text style={styles.buttonText}>
                {this.renderLocString(question.locAddPanelText) || "Add New"}
              </Text>
            </Pressable>
          )}
        </View>
      );
    } else {
      // Navigation/Progress Mode - Render only the current panel
      const activePanelIndex = question.currentIndex;
      const activePanel = question.panels[activePanelIndex];

      if (!activePanel) return null;

      const progressPercent = question.panelCount > 0 ? `${((activePanelIndex + 1) / question.panelCount) * 100}%` : "0%";

      return (
        <View style={styles.container}>
          {/* Progress Indicator */}
          <View style={[styles.progressBarOuter, { backgroundColor: theme.colors.border, borderRadius: theme.borderRadius.small }]}>
            <View style={[styles.progressBarInner, { width: progressPercent as any, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.small }]} />
          </View>

          <View style={styles.panelWrapper}>
            <View style={styles.panelHeaderRow}>
              <Text style={[styles.panelNumberText, { color: theme.colors.textLight }]}>
                Panel {activePanelIndex + 1} of {question.panelCount}
              </Text>
              {question.canRemovePanel && (
                <Pressable
                  style={[styles.removeButton, { borderColor: theme.colors.error, borderRadius: theme.borderRadius.small }]}
                  onPress={() => question.removePanel(activePanel)}
                >
                  <Text style={[styles.removeButtonText, { color: theme.colors.error }]}>
                    Remove
                  </Text>
                </Pressable>
              )}
            </View>
            <SurveyPanel element={activePanel} services={this.props.services} />
          </View>

          {/* Navigation Controls */}
          <View style={styles.navControls}>
            <Pressable
              disabled={activePanelIndex === 0}
              style={[styles.navButton, { borderColor: theme.colors.border, borderRadius: theme.borderRadius.medium }, activePanelIndex === 0 && styles.disabledButton]}
              onPress={() => { question.currentIndex = activePanelIndex - 1; }}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.text }, activePanelIndex === 0 && styles.disabledText]}>
                Prev
              </Text>
            </Pressable>

            {question.canAddPanel && (
              <Pressable
                style={[styles.addButton, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.medium, marginHorizontal: 8 }]}
                onPress={() => question.addPanel()}
              >
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            )}

            <Pressable
              disabled={activePanelIndex === question.panelCount - 1}
              style={[styles.navButton, { borderColor: theme.colors.border, borderRadius: theme.borderRadius.medium }, activePanelIndex === question.panelCount - 1 && styles.disabledButton]}
              onPress={() => { question.currentIndex = activePanelIndex + 1; }}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.text }, activePanelIndex === question.panelCount - 1 && styles.disabledText]}>
                Next
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  placeholderCard: {
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  placeholderText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center"
  },
  panelWrapper: {
    marginBottom: 16
  },
  panelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 4
  },
  panelNumberText: {
    fontSize: 14,
    fontWeight: "bold"
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  removeButton: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: "600"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14
  },
  progressBarOuter: {
    height: 6,
    width: "100%",
    overflow: "hidden",
    marginBottom: 8
  },
  progressBarInner: {
    height: "100%"
  },
  navControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12
  },
  navButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600"
  },
  disabledButton: {
    opacity: 0.5
  },
  disabledText: {
    color: "#cccccc"
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("paneldynamic", (props) => (
  <PanelDynamicQuestion {...props} />
));
