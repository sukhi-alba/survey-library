import { TextQuestion } from "./questions/TextQuestion";
import { CommentQuestion } from "./questions/CommentQuestion";
import { CheckboxQuestion } from "./questions/CheckboxQuestion";
import { RadioQuestion } from "./questions/RadioQuestion";
import { DropdownQuestion } from "./questions/DropdownQuestion";
import { ExpressionQuestion } from "./questions/ExpressionQuestion";
import { PanelDynamicQuestion } from "./questions/PanelDynamicQuestion";
import { ImageQuestion } from "./questions/ImageQuestion";
import { FileQuestion } from "./questions/FileQuestion";
import { SignatureQuestion } from "./questions/SignatureQuestion";
import { ReactNativeQuestionCustom, ReactNativeQuestionComposite } from "./questions/CustomQuestion";
import { LocationQuestion } from "./questions/LocationQuestion";
import { MatrixQuestion } from "./questions/MatrixQuestion";
import { MatrixDropdownQuestion } from "./questions/MatrixDropdownQuestion";
import { MatrixDynamicQuestion } from "./questions/MatrixDynamicQuestion";
import { BooleanQuestion } from "./questions/BooleanQuestion";
import { RatingQuestion } from "./questions/RatingQuestion";
import { SliderQuestion } from "./questions/SliderQuestion";
import { RankingQuestion } from "./questions/RankingQuestion";
import { HtmlQuestion } from "./questions/HtmlQuestion";
import { TagboxQuestion } from "./questions/TagboxQuestion";
import { MultipleTextQuestion } from "./questions/MultipleTextQuestion";
import { ImagePickerQuestion } from "./questions/ImagePickerQuestion";

import * as React from "react";
import { ReactNativeQuestionFactory } from "./ReactNativeFactories";

// Register "string" as a delegate to the "text" renderer so surveys that use
// { type: "string" } render correctly.
ReactNativeQuestionFactory.Instance.registerQuestion("string", (props) =>
  ReactNativeQuestionFactory.Instance.createQuestion("text", props) ?? React.createElement(React.Fragment)
);

// Prevent bundlers (like Metro, Webpack, esbuild) from tree-shaking the side-effect
// registrations inside individual question files. By referencing the classes here,
// we guarantee they are compiled and executed.
const questionRegistry = [
  TextQuestion,
  CommentQuestion,
  CheckboxQuestion,
  RadioQuestion,
  DropdownQuestion,
  ExpressionQuestion,
  PanelDynamicQuestion,
  ImageQuestion,
  FileQuestion,
  SignatureQuestion,
  ReactNativeQuestionCustom,
  ReactNativeQuestionComposite,
  LocationQuestion,
  MatrixQuestion,
  MatrixDropdownQuestion,
  MatrixDynamicQuestion,
  BooleanQuestion,
  RatingQuestion,
  SliderQuestion,
  RankingQuestion,
  HtmlQuestion,
  TagboxQuestion,
  MultipleTextQuestion,
  ImagePickerQuestion,
];

// Export public API
export {
  Survey,
  SurveyQuestion,
  SurveyPage,
  SurveyPanel,
  SurveyRow,
  SurveyRowElement,
  SurveyElementErrors,
} from "./Survey";
export { ReactNativeSurveyElement } from "./ReactNativeSurveyElement";
export { ReactNativeQuestionFactory, ReactNativeElementFactory } from "./ReactNativeFactories";
export { getTheme, setTheme, defaultTheme } from "./theme";
export type { ISurveyTheme } from "./theme";
export { serializeSurveyState, restoreSurveyState } from "./offline";

// Export utilities & registry reference to ensure it is not optimized away
export { stripHtml } from "./utils/htmlUtils";
export { questionRegistry };
