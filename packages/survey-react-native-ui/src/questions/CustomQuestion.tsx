import * as React from "react";
import { View, Text } from "react-native";
import { QuestionCustomModel, QuestionCompositeModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory, ReactNativeElementFactory } from "../ReactNativeFactories";
import { SurveyPanel, SurveyQuestion } from "../Survey";

export class ReactNativeQuestionCustom extends ReactNativeSurveyElement<{ question: QuestionCustomModel, services?: any }> {
  protected getStateElements() {
    const res = super.getStateElements();
    if (this.props.question.contentQuestion) {
      res.push(this.props.question.contentQuestion);
    }
    return res;
  }
  get question() {
    return this.props.question;
  }
  render() {
    const contentQuestion = this.question.contentQuestion;
    if (!contentQuestion) return null;

    let elementType = contentQuestion.isDefaultRendering() ? contentQuestion.getTemplate() : contentQuestion.getComponentName();
    if (!ReactNativeQuestionFactory.Instance.getAllTypes().includes(elementType)) {
      elementType = "question";
    }

    return ReactNativeQuestionFactory.Instance.createQuestion(elementType, {
      question: contentQuestion,
      services: this.props.services
    });
  }
}

export class ReactNativeQuestionComposite extends ReactNativeSurveyElement<{ question: QuestionCompositeModel, services?: any }> {
  get question() {
    return this.props.question;
  }
  render() {
    const contentPanel = this.question.contentPanel;
    if (!contentPanel) return null;

    return (
      <SurveyPanel
        element={contentPanel}
        services={this.props.services}
      />
    );
  }
}

ReactNativeQuestionFactory.Instance.registerQuestion("custom", (props) => (
  <ReactNativeQuestionCustom {...props} />
));

ReactNativeQuestionFactory.Instance.registerQuestion("composite", (props) => (
  <ReactNativeQuestionComposite {...props} />
));
