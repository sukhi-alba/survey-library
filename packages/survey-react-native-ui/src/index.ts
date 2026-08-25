// Core question types
import "./questions/TextQuestion";
import "./questions/CommentQuestion";
import "./questions/CheckboxQuestion";
import "./questions/RadioQuestion";
import "./questions/DropdownQuestion";
import "./questions/ExpressionQuestion";
import "./questions/PanelDynamicQuestion";
import "./questions/ImageQuestion";
import "./questions/FileQuestion";
import "./questions/SignatureQuestion";
import "./questions/CustomQuestion";
import "./questions/LocationQuestion";

// Matrix question types
import "./questions/MatrixQuestion";
import "./questions/MatrixDropdownQuestion";
import "./questions/MatrixDynamicQuestion";

// New question types
import "./questions/BooleanQuestion";
import "./questions/RatingQuestion";
import "./questions/SliderQuestion";
import "./questions/RankingQuestion";
import "./questions/HtmlQuestion";
import "./questions/TagboxQuestion";
import "./questions/MultipleTextQuestion";
import "./questions/ImagePickerQuestion";

// "string" is a SurveyJS alias for a single-line text question.
// Register it as a delegate to the "text" renderer so surveys that use
// { type: "string" } render correctly without an extra component.
import * as React from "react";
import { ReactNativeQuestionFactory } from "./ReactNativeFactories";
ReactNativeQuestionFactory.Instance.registerQuestion("string", (props) =>
  ReactNativeQuestionFactory.Instance.createQuestion("text", props) ?? React.createElement(React.Fragment)
);

// Public API exports
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

// Utility exports
export { stripHtml } from "./utils/htmlUtils";
