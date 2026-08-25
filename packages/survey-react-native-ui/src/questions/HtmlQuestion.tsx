import * as React from "react";
import { View, StyleSheet } from "react-native";
import { QuestionHtmlModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";
import { parseHtmlToReact } from "../utils/htmlUtils";

export class HtmlQuestion extends ReactNativeSurveyElement<{ question: QuestionHtmlModel }> {
  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const rawHtml = question.html || "";

    if (!rawHtml) return null;

    // Use our custom, lightweight HTML parser to render nested Text formatting nodes
    const renderedContent = parseHtmlToReact(rawHtml, theme.colors);

    return (
      <View style={styles.container}>
        {renderedContent}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("html", (props) => (
  <HtmlQuestion {...props} />
));
