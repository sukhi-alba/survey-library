import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { SurveyModel, PageModel, QuestionTextModel, QuestionCheckboxModel, QuestionPanelDynamicModel } from "survey-core";

// ==========================================
// 1. Mock React Native Primitives
// ==========================================
vi.mock("react-native", () => {
  const React = require("react");
  const MockComponent = (name: string) => {
    return (props: any) => {
      // If Pressable, we expose onPress directly
      if (name === "Pressable" && props.onPress) {
        return React.createElement(name, { ...props, onClick: props.onPress }, props.children);
      }
      return React.createElement(name, props, props.children);
    };
  };
  return {
    View: MockComponent("View"),
    Text: MockComponent("Text"),
    TextInput: MockComponent("TextInput"),
    Pressable: MockComponent("Pressable"),
    ScrollView: MockComponent("ScrollView"),
    KeyboardAvoidingView: MockComponent("KeyboardAvoidingView"),
    Platform: { OS: "ios" },
    SafeAreaView: MockComponent("SafeAreaView"),
    ActivityIndicator: MockComponent("ActivityIndicator"),
    Modal: MockComponent("Modal"),
    StyleSheet: {
      create: (obj: any) => obj
    }
  };
});

// Import our RN library elements
import {
  Survey,
  ReactNativeQuestionFactory,
  ReactNativeElementFactory,
  serializeSurveyState,
  restoreSurveyState
} from "../src/index";

// ==========================================
// 2. Test Suite
// ==========================================
describe("SurveyJS React Native UI Tests", () => {
  
  it("should load survey model and render pages/title", () => {
    const surveyJson = {
      title: "Test Survey",
      pages: [
        {
          name: "page1",
          elements: [
            { type: "text", name: "q1", title: "First Question" }
          ]
        }
      ]
    };
    
    const surveyModel = new SurveyModel(surveyJson);
    expect(surveyModel.title).toBe("Test Survey");
    expect(surveyModel.pages.length).toBe(1);
    expect(surveyModel.currentPage.name).toBe("page1");
  });

  it("should update text question value and survey.data", () => {
    const json = {
      pages: [
        {
          elements: [
            { type: "text", name: "username" }
          ]
        }
      ]
    };
    
    const surveyModel = new SurveyModel(json);
    const question = surveyModel.getQuestionByName("username") as QuestionTextModel;
    expect(question.value).toBeUndefined();
    
    // Simulate user typing input in React Native
    question.value = "JohnDoe";
    expect(question.value).toBe("JohnDoe");
    expect(surveyModel.data).toEqual({ username: "JohnDoe" });
  });

  it("should update checkbox selection values", () => {
    const json = {
      pages: [
        {
          elements: [
            {
              type: "checkbox",
              name: "colors",
              choices: ["Red", "Green", "Blue"]
            }
          ]
        }
      ]
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("colors") as QuestionCheckboxModel;
    expect(q.isEmpty()).toBe(true);

    q.value = ["Red"];
    expect([...q.value]).toEqual(["Red"]);

    q.value = ["Red", "Blue"];
    expect([...q.value]).toEqual(["Red", "Blue"]);
    expect(survey.data).toEqual({ colors: ["Red", "Blue"] });
  });

  it("should evaluate expression question automatically", () => {
    const json = {
      pages: [
        {
          elements: [
            { type: "text", name: "a" },
            { type: "text", name: "b" },
            {
              type: "expression",
              name: "sum",
              expression: "{a} + {b}"
            }
          ]
        }
      ]
    };
    
    const survey = new SurveyModel(json);
    survey.setValue("a", 10);
    survey.setValue("b", 20);
    
    const sumQuestion = survey.getQuestionByName("sum");
    expect(sumQuestion.value).toBe(30);
  });

  it("should handle PanelDynamic additions and removals", () => {
    const json = {
      pages: [
        {
          elements: [
            {
              type: "paneldynamic",
              name: "contacts",
              templateElements: [
                { type: "text", name: "fullname" }
              ],
              panelCount: 1
            }
          ]
        }
      ]
    };
    
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("contacts") as QuestionPanelDynamicModel;
    expect(q.panelCount).toBe(1);

    // Add panel
    q.addPanel();
    expect(q.panelCount).toBe(2);

    // Update nested value
    const firstPanel = q.panels[0];
    const fullnameQ = firstPanel.getQuestionByName("fullname");
    fullnameQ.value = "Alice";
    expect(survey.data).toEqual({
      contacts: [
        { fullname: "Alice" },
        {}
      ]
    });

    // Remove panel
    q.removePanel(1);
    expect(q.panelCount).toBe(1);
  });

  it("should support offline state serialization and restoration", () => {
    const json = {
      pages: [
        {
          elements: [
            { type: "text", name: "age" }
          ]
        },
        {
          elements: [
            { type: "text", name: "gender" }
          ]
        }
      ]
    };

    const survey = new SurveyModel(json);
    survey.setValue("age", "25");
    survey.nextPage();

    // Serialize state
    const savedState = serializeSurveyState(survey);
    expect(savedState.data).toEqual({ age: "25" });
    expect(savedState.currentPageNo).toBe(1);

    // Restore state into another model
    const freshSurvey = new SurveyModel(json);
    restoreSurveyState(freshSurvey, savedState);
    expect(freshSurvey.data).toEqual({ age: "25" });
    expect(freshSurvey.currentPageNo).toBe(1);
  });

  it("should resolve and call custom location coordinates mapping", () => {
    const locationRenderer = ReactNativeQuestionFactory.Instance.createQuestion("location", {
      question: {
        value: { latitude: 37.7749, longitude: -122.4194 }
      }
    });
    expect(locationRenderer).not.toBeNull();
  });
});
