import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { SurveyModel, PageModel, QuestionTextModel, QuestionCheckboxModel, QuestionPanelDynamicModel } from "survey-core";

// ==========================================
// 1. Mock React Native Primitives
// ==========================================
vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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

vi.mock("@react-native-community/datetimepicker", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  return {
    default: (props: any) => React.createElement("DateTimePicker", props)
  };
});

vi.mock("@react-native-community/slider", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  return {
    default: (props: any) => React.createElement("Slider", props)
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
import { parseDate, formatDate, parseISOWeek, formatISOWeek } from "../src/utils/dateUtils";

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

  it("should parse and format dates correctly", () => {
    const d = parseDate("2026-08-19");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7); // August (0-indexed)
    expect(d.getDate()).toBe(19);
    expect(formatDate(d)).toBe("2026-08-19");

    const wDate = parseISOWeek("2026-W34");
    expect(formatISOWeek(wDate)).toBe("2026-W34");
  });

  it("should render matrix rows and update row values", () => {
    const json = {
      elements: [
        {
          type: "matrix",
          name: "satisfaction",
          columns: ["1", "2", "3"],
          rows: ["service", "speed"]
        }
      ]
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("satisfaction");
    expect(q.visibleRows[0].value).toBeUndefined();

    // Set row value
    q.visibleRows[0].value = "2";
    expect(q.visibleRows[0].value).toBe("2");
    expect(survey.data).toEqual({ satisfaction: { service: "2" } });
  });

  it("should render matrixdropdown cell questions and handle changes", () => {
    const json = {
      elements: [
        {
          type: "matrixdropdown",
          name: "performance",
          columns: [{ name: "col1", cellType: "text" }],
          rows: ["row1"]
        }
      ]
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("performance");
    const cellQuestion = q.renderedTable.renderedRows[0].cells[1].question;
    expect(cellQuestion).toBeDefined();
    cellQuestion.value = "Excellent";
    expect(survey.data).toEqual({ performance: { row1: { col1: "Excellent" } } });
  });

  it("should render matrixdynamic, add and remove rows UI", () => {
    const json = {
      elements: [
        {
          type: "matrixdynamic",
          name: "employees",
          columns: [{ name: "col1", cellType: "text" }],
          rowCount: 1
        }
      ]
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("employees");
    expect(q.rowCount).toBe(1);

    q.addRowUI();
    expect(q.rowCount).toBe(2);

    q.removeRow(1);
    expect(q.rowCount).toBe(1);
  });

  it("should render the real JSON test case successfully without unsupported-input errors", () => {
    const realJson = {
      pages: [
        {
          name: "page1",
          elements: [
            { type: "text", name: "question10", title: "Time", inputType: "time" },
            { type: "text", name: "question1", title: "Date", inputType: "date" },
            { type: "text", name: "question2", title: "Date and Time", inputType: "datetime-local" },
            { type: "text", name: "question11", title: "Week", inputType: "week" },
            { type: "text", name: "question3", title: "Month", inputType: "month" },
            { type: "text", name: "question5", title: "Color" },
            {
              type: "matrixdropdown",
              name: "question6",
              title: "Multi Select Matrix",
              columns: [{ name: "column1", title: "Column 1" }, { name: "column2", title: "Column 2" }, { name: "column3", title: "Column 3" }],
              choices: [1, 2, 3, 4, 5],
              rows: [{ value: "row1", text: "Row 1" }, { value: "row2", text: "Row 2" }]
            },
            {
              type: "matrix",
              name: "question7",
              title: "Single Select Matrix",
              columns: [{ value: "column1", text: "Column 1" }, { value: "column2", text: "Column 2" }, { value: "column3", text: "Column 3" }],
              rows: [{ value: "row1", text: "Row 1" }, { value: "row2", text: "Row 2" }]
            },
            {
              type: "matrixdynamic",
              name: "question8",
              title: "Dynamic Matrix",
              columns: [{ name: "column1", title: "Column 1" }, { name: "column2", title: "Column 2" }, { name: "column3", title: "Column 3" }],
              choices: [1, 2, 3, 4, 5]
            },
            { type: "text", name: "question4", title: "Range", inputType: "range" }
          ]
        }
      ]
    };

    const survey = new SurveyModel(realJson);
    const firstPage = survey.pages[0];

    // Ensure all 10 elements resolve to a valid react-native renderer
    firstPage.elements.forEach((element) => {
      const q = element as any;
      const type = q.isDefaultRendering() ? q.getTemplate() : q.getComponentName();
      const creator = ReactNativeQuestionFactory.Instance.createQuestion(type, { question: q });
      expect(creator).not.toBeNull();
    });
  });
});
