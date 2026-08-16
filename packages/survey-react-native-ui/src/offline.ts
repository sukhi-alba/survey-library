import { SurveyModel } from "survey-core";

/**
 * Serializes the current survey response state and active page number for local storage.
 * @param survey The SurveyModel instance.
 */
export function serializeSurveyState(survey: SurveyModel) {
  return {
    data: survey.data,
    currentPageNo: survey.currentPageNo
  };
}

/**
 * Restores serialized response data and active page number into a SurveyModel instance.
 * @param survey The SurveyModel instance.
 * @param state The serialized state containing response data and page number.
 */
export function restoreSurveyState(survey: SurveyModel, state: { data: any, currentPageNo?: number }) {
  if (state.data) {
    survey.data = state.data;
  }
  if (state.currentPageNo !== undefined) {
    survey.currentPageNo = state.currentPageNo;
  }
}
