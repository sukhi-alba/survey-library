import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { QuestionHtmlModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";
import { stripHtml } from "../utils/htmlUtils";

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

    /**
     * SurveyJS HTML questions contain arbitrary HTML markup.
     * React Native cannot render HTML natively without a WebView.
     *
     * For security and simplicity, HTML tags are stripped and the
     * plain text content is rendered. This intentionally avoids
     * executing any scripts, loading external content, or
     * introducing a WebView dependency.
     *
     * Limitation: Rich formatting (bold, links, images inside HTML)
     * is not rendered. Only the textual content is preserved.
     */
    const plainText = stripHtml(question.html || "");

    if (!plainText) return null;

    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: theme.colors.text }]}>
          {plainText}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("html", (props) => (
  <HtmlQuestion {...props} />
));
