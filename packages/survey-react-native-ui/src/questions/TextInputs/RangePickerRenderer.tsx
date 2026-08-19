import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { QuestionTextModel } from "survey-core";
import { getTheme } from "../../theme";

interface RangePickerProps {
  question: QuestionTextModel;
}

export function RangePickerRenderer({ question }: RangePickerProps) {
  const theme = getTheme();

  const min = question.min !== undefined && question.min !== "" ? Number(question.min) : 0;
  const max = question.max !== undefined && question.max !== "" ? Number(question.max) : 100;
  const step = question.step !== undefined && question.step !== "" ? Number(question.step) : 1;

  // Enforce float boundaries and default to midpoint if empty
  const midpoint = min + (max - min) / 2;
  const currentValue = question.value !== undefined && question.value !== "" ? Number(question.value) : midpoint;

  const [sliderValue, setSliderValue] = React.useState(currentValue);

  // Sync state if model value changes programmatically
  React.useEffect(() => {
    if (question.value !== undefined && question.value !== "") {
      setSliderValue(Number(question.value));
    } else {
      setSliderValue(midpoint);
    }
  }, [question.value, min, max, midpoint]);

  const handleValueChange = (val: number) => {
    setSliderValue(val);
    // Enforce decimal step precision (e.g. step = 0.1)
    const rounded = Math.round(val / step) * step;
    // Format to avoid floating point representation noise (e.g. 0.30000000000000004)
    const decimalPlaces = (String(step).split(".")[1] || "").length;
    const finalValue = parseFloat(rounded.toFixed(decimalPlaces));
    question.value = finalValue;
  };

  return (
    <View style={styles.container}>
      <View style={styles.valueRow}>
        <Text style={[styles.limitText, { color: theme.colors.textLight }]}>{min}</Text>
        <Text style={[styles.valueText, { color: theme.colors.primary }]}>
          {question.value !== undefined && question.value !== "" ? String(sliderValue) : `Select Value (Mid: ${midpoint})`}
        </Text>
        <Text style={[styles.limitText, { color: theme.colors.textLight }]}>{max}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={sliderValue}
        disabled={question.isInputReadOnly}
        onValueChange={handleValueChange}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={question.isInputReadOnly ? theme.colors.placeholder : theme.colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: "100%"
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8
  },
  limitText: {
    fontSize: 12
  },
  valueText: {
    fontSize: 15,
    fontWeight: "bold"
  },
  slider: {
    width: "100%",
    height: 40
  }
});
