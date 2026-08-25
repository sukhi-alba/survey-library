import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import {
  SurveyModel,
  PageModel,
  QuestionTextModel,
  QuestionCheckboxModel,
  QuestionPanelDynamicModel,
  QuestionBooleanModel,
  QuestionRatingModel,
  QuestionRankingModel,
  QuestionMultipleTextModel,
  QuestionImagePickerModel,
  QuestionMatrixModel,
  QuestionMatrixDynamicModel,
  QuestionTagboxModel,
} from "survey-core";

// ==========================================
// 1. Mock React Native Primitives
// ==========================================
vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  const MockComponent = (name: string) => {
    return (props: any) => {
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
    Switch: MockComponent("Switch"),
    Image: MockComponent("Image"),
    StyleSheet: {
      create: (obj: any) => obj,
    },
    Dimensions: {
      get: () => ({ width: 390, height: 844 }),
    },
  };
});

vi.mock("@react-native-community/datetimepicker", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  return {
    default: (props: any) => React.createElement("DateTimePicker", props),
  };
});

vi.mock("@react-native-community/slider", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  return {
    default: (props: any) => React.createElement("Slider", props),
  };
});

// Import our RN library elements
import {
  Survey,
  ReactNativeQuestionFactory,
  ReactNativeElementFactory,
  serializeSurveyState,
  restoreSurveyState,
} from "../src/index";
import { parseDate, formatDate, parseISOWeek, formatISOWeek } from "../src/utils/dateUtils";
import { stripHtml } from "../src/utils/htmlUtils";

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
            { type: "text", name: "q1", title: "First Question" },
          ],
        },
      ],
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
            { type: "text", name: "username" },
          ],
        },
      ],
    };

    const surveyModel = new SurveyModel(json);
    const question = surveyModel.getQuestionByName("username") as QuestionTextModel;
    expect(question.value).toBeUndefined();

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
              choices: ["Red", "Green", "Blue"],
            },
          ],
        },
      ],
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
              expression: "{a} + {b}",
            },
          ],
        },
      ],
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
                { type: "text", name: "fullname" },
              ],
              panelCount: 1,
            },
          ],
        },
      ],
    };

    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("contacts") as QuestionPanelDynamicModel;
    expect(q.panelCount).toBe(1);

    q.addPanel();
    expect(q.panelCount).toBe(2);

    const firstPanel = q.panels[0];
    const fullnameQ = firstPanel.getQuestionByName("fullname");
    fullnameQ.value = "Alice";
    expect(survey.data).toEqual({
      contacts: [
        { fullname: "Alice" },
        {},
      ],
    });

    q.removePanel(1);
    expect(q.panelCount).toBe(1);
  });

  it("should support offline state serialization and restoration", () => {
    const json = {
      pages: [
        { elements: [{ type: "text", name: "age" }] },
        { elements: [{ type: "text", name: "gender" }] },
      ],
    };

    const survey = new SurveyModel(json);
    survey.setValue("age", "25");
    survey.nextPage();

    const savedState = serializeSurveyState(survey);
    expect(savedState.data).toEqual({ age: "25" });
    expect(savedState.currentPageNo).toBe(1);

    const freshSurvey = new SurveyModel(json);
    restoreSurveyState(freshSurvey, savedState);
    expect(freshSurvey.data).toEqual({ age: "25" });
    expect(freshSurvey.currentPageNo).toBe(1);
  });

  it("should resolve and call custom location coordinates mapping", () => {
    const locationRenderer = ReactNativeQuestionFactory.Instance.createQuestion("location", {
      question: {
        value: { latitude: 37.7749, longitude: -122.4194 },
      },
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
          rows: ["service", "speed"],
        },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("satisfaction");
    expect(q.visibleRows[0].value).toBeUndefined();

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
          rows: ["row1"],
        },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("performance");

    // Data rows in renderedRows have a truthy row property (header rows have undefined row)
    const dataRows = q.renderedTable.renderedRows.filter((r: any) => !!r.row);
    expect(dataRows.length).toBe(1);

    const cellQuestion = dataRows[0].cells[1]?.question;

    // Find first data row's first question cell
    const firstDataRow = dataRows[0];
    const questionCell = firstDataRow.cells.find((c: any) => c.hasQuestion);
    expect(questionCell).toBeDefined();
    questionCell.question.value = "Excellent";
    expect(survey.data).toEqual({ performance: { row1: { col1: "Excellent" } } });
  });

  it("should render matrixdynamic, add and remove rows", () => {
    const json = {
      elements: [
        {
          type: "matrixdynamic",
          name: "employees",
          columns: [{ name: "col1", cellType: "text" }],
          rowCount: 1,
        },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("employees") as QuestionMatrixDynamicModel;
    expect(q.rowCount).toBe(1);

    q.addRowUI();
    expect(q.rowCount).toBe(2);

    q.removeRow(1);
    expect(q.rowCount).toBe(1);
  });

  // ==========================================
  // NEW: Boolean question tests
  // ==========================================
  it("should handle boolean question value (true/false/undefined)", () => {
    const json = {
      elements: [{ type: "boolean", name: "agree" }],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("agree") as QuestionBooleanModel;
    expect(q.value).toBeUndefined();

    q.value = true;
    expect(q.value).toBe(true);
    expect(survey.data).toEqual({ agree: true });

    q.value = false;
    expect(q.value).toBe(false);
    expect(survey.data).toEqual({ agree: false });
  });

  it("should handle boolean labelTrue and labelFalse", () => {
    const json = {
      elements: [
        { type: "boolean", name: "accept", labelTrue: "Yes, I agree", labelFalse: "No, I don't" },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("accept") as QuestionBooleanModel;
    expect(q.labelTrue).toBe("Yes, I agree");
    expect(q.labelFalse).toBe("No, I don\u0027t");
  });

  // ==========================================
  // NEW: Rating question tests
  // ==========================================
  it("should handle rating question value and rateMin/rateMax", () => {
    const json = {
      elements: [{ type: "rating", name: "score", rateMin: 1, rateMax: 5 }],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("score") as QuestionRatingModel;
    expect(q.rateMin).toBe(1);
    expect(q.rateMax).toBe(5);

    q.value = 4;
    expect(q.value).toBe(4);
    expect(survey.data).toEqual({ score: 4 });
  });

  it("should provide visibleRateValues for default rating range", () => {
    const json = {
      elements: [{ type: "rating", name: "r", rateMin: 1, rateMax: 3 }],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("r") as QuestionRatingModel;
    const vals = q.visibleRateValues;
    expect(vals).toBeDefined();
    expect(Array.isArray(vals)).toBe(true);
    expect(vals.length).toBe(3);
    expect(vals[0].value).toBe(1);
    expect(vals[2].value).toBe(3);
  });

  // ==========================================
  // NEW: Ranking question tests
  // ==========================================
  it("should set ranking value as ordered array", () => {
    const json = {
      elements: [
        {
          type: "ranking",
          name: "rank",
          choices: ["A", "B", "C"],
        },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("rank") as QuestionRankingModel;
    expect(Array.isArray(q.value) || q.value === undefined).toBe(true);

    q.value = ["B", "A", "C"];
    expect([...q.value]).toEqual(["B", "A", "C"]);
    expect(survey.data).toEqual({ rank: ["B", "A", "C"] });
  });

  // ==========================================
  // NEW: MultipleText question tests
  // ==========================================
  it("should update multipletext items and build value object", () => {
    const json = {
      elements: [
        {
          type: "multipletext",
          name: "contact",
          items: [
            { name: "first", title: "First Name" },
            { name: "last", title: "Last Name" },
          ],
        },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("contact") as QuestionMultipleTextModel;
    expect(q.items.length).toBe(2);

    q.items[0].value = "Jane";
    q.items[1].value = "Doe";

    expect(survey.data).toEqual({ contact: { first: "Jane", last: "Doe" } });
  });

  it("should handle programmatic multipletext value assignment", () => {
    const json = {
      elements: [
        {
          type: "multipletext",
          name: "addr",
          items: [
            { name: "city" },
            { name: "zip" },
          ],
        },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("addr") as QuestionMultipleTextModel;
    survey.data = { addr: { city: "Seattle", zip: "98101" } };
    expect(q.items[0].value).toBe("Seattle");
    expect(q.items[1].value).toBe("98101");
  });

  // ==========================================
  // NEW: ImagePicker question tests
  // ==========================================
  it("should handle single-select imagepicker value", () => {
    const json = {
      elements: [
        {
          type: "imagepicker",
          name: "img",
          choices: [
            { value: "lion", imageLink: "https://example.com/lion.jpg" },
            { value: "giraffe", imageLink: "https://example.com/giraffe.jpg" },
          ],
        },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("img") as QuestionImagePickerModel;
    expect(q.visibleChoices.length).toBe(2);

    q.value = "lion";
    expect(q.value).toBe("lion");
    expect(survey.data).toEqual({ img: "lion" });
  });

  it("should handle multi-select imagepicker value", () => {
    const json = {
      elements: [
        {
          type: "imagepicker",
          name: "imgs",
          multiSelect: true,
          choices: [
            { value: "a", imageLink: "https://example.com/a.jpg" },
            { value: "b", imageLink: "https://example.com/b.jpg" },
            { value: "c", imageLink: "https://example.com/c.jpg" },
          ],
        },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("imgs") as QuestionImagePickerModel;
    q.value = ["a", "c"];
    expect(survey.data).toEqual({ imgs: ["a", "c"] });
  });

  // ==========================================
  // NEW: Tagbox question tests
  // ==========================================
  it("should handle tagbox multi-select value", () => {
    const json = {
      elements: [
        {
          type: "tagbox",
          name: "tags",
          choices: ["Alpha", "Beta", "Gamma"],
        },
      ],
    };
    const survey = new SurveyModel(json);
    const q = survey.getQuestionByName("tags") as QuestionTagboxModel;
    expect(Array.isArray(q.value)).toBe(true);
    expect(q.value.length).toBe(0);

    q.value = ["Alpha", "Gamma"];
    expect(survey.data).toEqual({ tags: ["Alpha", "Gamma"] });
  });

  // ==========================================
  // NEW: HTML utility tests
  // ==========================================
  it("should strip HTML tags from html question content", () => {
    const html = "<h3>Notice:</h3><p>Please <b>read</b> carefully.</p>";
    const stripped = stripHtml(html);
    expect(stripped).not.toContain("<");
    expect(stripped).not.toContain(">");
    expect(stripped).toContain("Notice:");
    expect(stripped).toContain("read");
    expect(stripped).toContain("carefully.");
  });

  it("should decode HTML entities in stripHtml", () => {
    const html = "Tom &amp; Jerry &lt;vs&gt; &quot;Spike&quot;";
    const stripped = stripHtml(html);
    expect(stripped).toBe('Tom & Jerry <vs> "Spike"');
  });

  it("should convert br and p tags to newlines in stripHtml", () => {
    const html = "Line 1<br>Line 2<br />Line 3<p>Para</p>";
    const stripped = stripHtml(html);
    expect(stripped).toContain("\n");
    expect(stripped).toContain("Line 1");
    expect(stripped).toContain("Line 2");
  });

  // ==========================================
  // NEW: Factory registration check
  // ==========================================
  it("should resolve all new question types from factory", () => {
    const typesToCheck = [
      "boolean", "rating", "slider", "ranking", "html",
      "tagbox", "multipletext", "imagepicker", "string",
    ];

    typesToCheck.forEach((type) => {
      const survey = new SurveyModel({
        elements: [{ type, name: "q_" + type }],
      });
      const element = survey.pages[0]?.elements[0] as any;
      if (element) {
        const resolvedType = element.isDefaultRendering?.()
          ? element.getTemplate?.()
          : element.getComponentName?.() ?? type;
        const renderer = ReactNativeQuestionFactory.Instance.createQuestion(
          resolvedType || type,
          { question: element }
        );
        expect(renderer).not.toBeNull();
      }
    });
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
              columns: [
                { name: "column1", title: "Column 1" },
                { name: "column2", title: "Column 2" },
                { name: "column3", title: "Column 3" },
              ],
              choices: [1, 2, 3, 4, 5],
              rows: [{ value: "row1", text: "Row 1" }, { value: "row2", text: "Row 2" }],
            },
            {
              type: "matrix",
              name: "question7",
              title: "Single Select Matrix",
              columns: [
                { value: "column1", text: "Column 1" },
                { value: "column2", text: "Column 2" },
                { value: "column3", text: "Column 3" },
              ],
              rows: [{ value: "row1", text: "Row 1" }, { value: "row2", text: "Row 2" }],
            },
            {
              type: "matrixdynamic",
              name: "question8",
              title: "Dynamic Matrix",
              columns: [
                { name: "column1", title: "Column 1" },
                { name: "column2", title: "Column 2" },
                { name: "column3", title: "Column 3" },
              ],
              choices: [1, 2, 3, 4, 5],
            },
            { type: "text", name: "question4", title: "Range", inputType: "range" },
          ],
        },
      ],
    };

    const survey = new SurveyModel(realJson);
    const firstPage = survey.pages[0];

    firstPage.elements.forEach((element) => {
      const q = element as any;
      const type = q.isDefaultRendering() ? q.getTemplate() : q.getComponentName();
      const creator = ReactNativeQuestionFactory.Instance.createQuestion(type, { question: q });
      expect(creator).not.toBeNull();
    });
  });
});
