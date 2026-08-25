/**
 * ImagePickerQuestion Component
 * Renders a grid of selectable images for picking single or multiple choices.
 */
import * as React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { QuestionImagePickerModel, ItemValue } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

/**
 * ImagePickerQuestion renders a grid of selectable image choices.
 *
 * SurveyJS type: "imagepicker" (QuestionImagePickerModel)
 *
 * This is distinct from the "image" type (QuestionImageModel) which only
 * displays a single non-interactive image.
 *
 * Key properties:
 * - question.visibleChoices: ItemValue[] - each has .value and .imageLink (runtime)
 * - question.multiSelect: boolean - single vs multi-select
 * - question.imageFit: "contain" | "cover" | "fill" | "none"
 * - question.renderedImageWidth / renderedImageHeight: computed px dimensions
 * - question.colCount: 0 = auto (we default to 2 columns)
 *
 * Value shape:
 * - Single select: string (selected choice value)
 * - Multi select: string[] (selected choice values)
 *
 * Images are loaded via React Native's built-in Image component (no library required).
 * Failed images show a fallback placeholder so the survey remains usable offline or
 * when remote images are unavailable.
 */

// Runtime extension: ImagePickerModel choices have .imageLink on each ItemValue
interface ImageChoice extends ItemValue {
  imageLink?: string;
}

interface ImagePickerState {
  loadErrors: Record<string, boolean>;
}

export class ImagePickerQuestion extends ReactNativeSurveyElement<
  { question: QuestionImagePickerModel },
  ImagePickerState
> {
  constructor(props: { question: QuestionImagePickerModel }) {
    super(props);
    this.state = { loadErrors: {} };
  }

  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  private get isMultiSelect(): boolean {
    return (this.props.question as any).multiSelect === true;
  }

  private isSelected(choice: ImageChoice): boolean {
    const val = this.question.value;
    if (this.isMultiSelect) {
      return (
        Array.isArray(val) &&
        val.some((v) => v == choice.value || String(v) === String(choice.value))
      );
    }
    return val == choice.value || (val !== undefined && String(val) === String(choice.value));
  }

  private toggleItem(choice: ImageChoice) {
    const question = this.question;
    if (question.isInputReadOnly) return;

    if (this.isMultiSelect) {
      const current: any[] = Array.isArray(question.value) ? [...question.value] : [];
      const idx = current.findIndex(
        (v) => v == choice.value || String(v) === String(choice.value)
      );
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        current.push(choice.value);
      }
      question.value = current.length > 0 ? current : undefined;
    } else {
      // Toggle off if already selected (allow deselect)
      const isCurrentlySelected =
        question.value == choice.value ||
        (question.value !== undefined && String(question.value) === String(choice.value));
      question.value = isCurrentlySelected ? undefined : choice.value;
    }
  }

  private handleLoadError(choiceValue: string) {
    this.setState((prev) => ({
      loadErrors: { ...prev.loadErrors, [String(choiceValue)]: true },
    }));
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const isReadOnly = question.isInputReadOnly;
    const choices = question.visibleChoices as ImageChoice[];

    if (!choices || choices.length === 0) {
      return (
        <Text style={{ color: theme.colors.placeholder }}>No image choices available</Text>
      );
    }

    /**
     * Image dimensions: use renderedImageWidth/Height (computed by survey-core
     * based on imageWidth/imageHeight and responsiveness). Fall back to 200x150.
     */
    const imgW: number = question.renderedImageWidth || 200;
    const imgH: number = question.renderedImageHeight || 150;

    const resizeModeMap: Record<string, "contain" | "cover" | "stretch" | "center"> = {
      contain: "contain",
      cover: "cover",
      fill: "stretch",
      none: "center",
    };
    const resizeMode = resizeModeMap[question.imageFit || "contain"] || "contain";

    return (
      <View style={styles.grid}>
        {choices.map((choice: ImageChoice) => {
          const selected = this.isSelected(choice);
          const hasError = this.state.loadErrors[String(choice.value)];
          const hasImage = !!choice.imageLink && !hasError;

          return (
            <Pressable
              key={String(choice.value)}
              disabled={isReadOnly}
              onPress={() => this.toggleItem(choice)}
              style={[
                styles.choiceCard,
                {
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderWidth: selected ? 3 : 1,
                  borderRadius: theme.borderRadius.medium,
                  backgroundColor: theme.colors.surface,
                  opacity: isReadOnly ? 0.7 : 1,
                },
              ]}
              accessibilityRole="radio"
              accessibilityLabel={choice.text || String(choice.value)}
              accessibilityState={{ checked: selected, disabled: isReadOnly }}
            >
              {hasImage ? (
                <Image
                  source={{ uri: choice.imageLink }}
                  style={[styles.image, { width: imgW, height: imgH }]}
                  resizeMode={resizeMode}
                  onError={() => this.handleLoadError(choice.value)}
                />
              ) : (
                <View
                  style={[
                    styles.imageFallback,
                    {
                      width: imgW,
                      height: imgH,
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  {hasError ? (
                    <Text style={{ color: theme.colors.textLight, fontSize: 12 }}>
                      Image unavailable
                    </Text>
                  ) : (
                    <ActivityIndicator size="small" color={theme.colors.textLight} />
                  )}
                </View>
              )}

              {(choice.text || this.isMultiSelect) && (
                <View
                  style={[
                    styles.labelRow,
                    {
                      backgroundColor: selected ? theme.colors.accent : "transparent",
                    },
                  ]}
                >
                  {this.isMultiSelect && (
                    <View
                      style={[
                        styles.checkBox,
                        {
                          borderColor: selected ? theme.colors.primary : theme.colors.border,
                          backgroundColor: selected ? theme.colors.primary : "transparent",
                        },
                      ]}
                    >
                      {selected && (
                        <Text style={styles.checkMark}>{"\u2713"}</Text>
                      )}
                    </View>
                  )}
                  {choice.text ? (
                    <Text
                      style={[
                        styles.choiceLabel,
                        { color: selected ? theme.colors.primary : theme.colors.text },
                      ]}
                      numberOfLines={2}
                    >
                      {choice.text}
                    </Text>
                  ) : null}
                </View>
              )}

              {selected && !this.isMultiSelect && (
                <View
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.selectedBadgeText}>{"\u2713"}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingVertical: 4,
  },
  choiceCard: {
    overflow: "hidden",
    position: "relative",
  },
  image: {
    display: "flex",
  },
  imageFallback: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  choiceLabel: {
    fontSize: 13,
    flex: 1,
  },
  selectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadgeText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("imagepicker", (props) => (
  <ImagePickerQuestion {...props} />
));
