import * as React from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { QuestionImageModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class ImageQuestion extends ReactNativeSurveyElement<{ question: QuestionImageModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }
  render() {
    const theme = getTheme();
    const question = this.question;

    if (!question.imageLink) {
      return (
        <View style={[styles.fallback, { borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.placeholder }}>No image link specified</Text>
        </View>
      );
    }

    const width = typeof question.imageWidth === "number" ? question.imageWidth : 200;
    const height = typeof question.imageHeight === "number" ? question.imageHeight : 150;

    return (
      <View style={styles.container}>
        <Image
          source={{ uri: question.imageLink }}
          style={[styles.image, { width: width, height: height, borderRadius: theme.borderRadius.small }]}
          resizeMode="contain"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4
  },
  image: {
    maxWidth: "100%"
  },
  fallback: {
    height: 150,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center"
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("image", (props) => (
  <ImageQuestion {...props} />
));
