import * as React from "react";
import { View, Text, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";
import { QuestionSliderModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class SliderQuestion extends ReactNativeSurveyElement<{ question: QuestionSliderModel }> {
  private trackRef = React.createRef<View>();
  private trackWidth = 0;

  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  // PanResponder to track dragging gestures smoothly
  private panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !this.question.isInputReadOnly,
    onMoveShouldSetPanResponder: () => !this.question.isInputReadOnly,
    onPanResponderGrant: (evt: GestureResponderEvent) => {
      this.handleTouch(evt.nativeEvent.locationX);
    },
    onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const touchX = evt.nativeEvent.locationX + gestureState.dx;
      this.handleTouch(touchX);
    },
  });

  private handleTouch(locationX: number) {
    const question = this.question;
    if (question.isInputReadOnly || this.trackWidth <= 0) return;

    const min = question.min !== undefined ? Number(question.min) : 0;
    const max = question.max !== undefined ? Number(question.max) : 100;
    const step = question.step !== undefined ? Number(question.step) : 1;

    // Constrain percentage between 0 and 1
    const pct = Math.max(0, Math.min(1, locationX / this.trackWidth));
    const rawVal = min + pct * (max - min);

    // Snap to nearest step size
    const rounded = Math.round(rawVal / step) * step;
    const finalVal = Math.max(min, Math.min(max, rounded));

    question.value = finalVal;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const isReadOnly = question.isInputReadOnly;

    const min = question.min !== undefined ? Number(question.min) : 0;
    const max = question.max !== undefined ? Number(question.max) : 100;
    const value = question.value !== undefined ? Number(question.value) : min;

    // Calculate percentage position of the thumb
    const range = max - min;
    const percentage = range > 0 ? (value - min) / range : 0;

    return (
      <View style={styles.container}>
        <View style={styles.valueRow}>
          <Text style={[styles.limitText, { color: theme.colors.textLight }]}>{min}</Text>
          <Text style={[styles.currentValue, { color: theme.colors.primary }]}>{value}</Text>
          <Text style={[styles.limitText, { color: theme.colors.textLight }]}>{max}</Text>
        </View>

        {/* Track container */}
        <View
          {...this.panResponder.panHandlers}
          ref={this.trackRef}
          onLayout={(e) => {
            this.trackWidth = e.nativeEvent.layout.width;
          }}
          style={styles.sliderWrapper}
        >
          {/* Background track line */}
          <View style={[styles.trackLine, { backgroundColor: theme.colors.border }]}>
            {/* Active filled line */}
            <View
              style={[
                styles.activeLine,
                {
                  width: `${percentage * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>

          {/* Thumb handle */}
          <View
            style={[
              styles.thumb,
              {
                left: `${percentage * 100}%`,
                borderColor: theme.colors.primary,
                backgroundColor: isReadOnly ? theme.colors.textLight : theme.colors.surface,
              },
            ]}
          />
        </View>
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
    marginBottom: 12,
  },
  limitText: {
    fontSize: 12,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sliderWrapper: {
    height: 30,
    justifyContent: "center",
    position: "relative",
    width: "100%",
  },
  trackLine: {
    height: 4,
    width: "100%",
    borderRadius: 2,
    position: "relative",
    overflow: "hidden",
  },
  activeLine: {
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    position: "absolute",
    top: 5,
    marginLeft: -10, // center-align thumb on left percentage coordinate
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("slider", (props) => (
  <SliderQuestion {...props} />
));
