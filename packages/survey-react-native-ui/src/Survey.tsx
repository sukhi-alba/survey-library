import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import {
  Base,
  SurveyModel,
  PageModel,
  PanelModel,
  PanelModelBase,
  Question,
  SurveyError,
  QuestionRowModel
} from "survey-core";
import { ReactNativeSurveyElement } from "./ReactNativeSurveyElement";
import { ReactNativeElementFactory, ReactNativeQuestionFactory } from "./ReactNativeFactories";
import { getTheme, setTheme, ISurveyTheme } from "./theme";

// ==========================================
// 1. SurveyElementErrors
// ==========================================
export class SurveyElementErrors extends React.Component<{ errors: Array<SurveyError> }> {
  render() {
    const theme = getTheme();
    const errorItems = this.props.errors.map((error, idx) => (
      <Text key={idx} style={[styles.errorText, { color: theme.colors.error }]}>
        • {error.getText()}
      </Text>
    ));
    return <View style={styles.errorContainer}>{errorItems}</View>;
  }
}

// ==========================================
// 2. SurveyQuestion
// ==========================================
export class SurveyQuestion extends ReactNativeSurveyElement<{ element: Question; services?: any }> {
  protected getStateElement(): Base {
    return this.props.element;
  }
  get question(): Question {
    return this.props.element;
  }
  render() {
    const theme = getTheme();
    const question = this.question;
    if (!question.isVisible) return null;

    const errors = question.errors && question.errors.length > 0 ? (
      <SurveyElementErrors errors={question.errors} />
    ) : null;

    const title = question.hasTitle ? (
      <Text style={[styles.questionTitle, { color: theme.colors.text }]}>
        {question.requiredText ? `${question.requiredText} ` : ""}{this.renderLocString(question.locTitle)}
      </Text>
    ) : null;

    const description = question.hasDescription ? (
      <Text style={[styles.questionDescription, { color: theme.colors.textLight }]}>
        {this.renderLocString(question.locDescription)}
      </Text>
    ) : null;

    // Resolve body via ReactNativeQuestionFactory
    const type = question.isDefaultRendering() ? question.getTemplate() : question.getComponentName();
    const body = ReactNativeQuestionFactory.Instance.createQuestion(type, {
      question: question,
      services: this.props.services
    }) || (
      <Text style={{ color: theme.colors.error }}>
        Unsupported question type: {type}
      </Text>
    );

    const comment = question.hasComment ? (
      <View style={styles.commentContainer}>
        <Text style={[styles.commentTitle, { color: theme.colors.textLight, marginBottom: theme.spacing.xsmall }]}>
          {this.renderLocString(question.locCommentText)}
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: theme.colors.border, color: theme.colors.text, borderRadius: theme.borderRadius.small }]}
          multiline={true}
          value={question.comment || ""}
          onChangeText={(val) => { question.comment = val; }}
          placeholder={question.commentPlaceholder || "Comment"}
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
    ) : null;

    return (
      <View style={[styles.questionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.borderRadius.medium }]}>
        {title}
        {description}
        {errors}
        <View style={styles.questionBody}>
          {body}
        </View>
        {comment}
      </View>
    );
  }
}

// ==========================================
// 3. SurveyRowElement
// ==========================================
export class SurveyRowElement extends React.Component<{ element: any; services?: any }> {
  render() {
    const element = this.props.element;
    if (!element.isVisible) return null;

    let elementType = element.getType();
    if (!ReactNativeElementFactory.Instance.isElementRegistered(elementType)) {
      elementType = "question";
    }

    return (
      <View style={styles.rowElement}>
        {ReactNativeElementFactory.Instance.createElement(elementType, {
          element: element,
          services: this.props.services
        })}
      </View>
    );
  }
}

// ==========================================
// 4. SurveyRow
// ==========================================
export class SurveyRow extends ReactNativeSurveyElement<{ row: QuestionRowModel; services?: any }> {
  protected getStateElement(): Base {
    return this.props.row;
  }
  get row(): QuestionRowModel {
    return this.props.row;
  }
  render() {
    if (!this.row.isNeedRender) return null;

    const elements = this.row.visibleElements.map((el) => (
      <SurveyRowElement key={el.id} element={el} services={this.props.services} />
    ));

    const isHorizontal = elements.length > 1;

    return (
      <View style={[styles.rowContainer, isHorizontal ? styles.rowHorizontal : styles.rowVertical]}>
        {elements}
      </View>
    );
  }
}

// ==========================================
// 5. SurveyPanel
// ==========================================
export class SurveyPanel extends ReactNativeSurveyElement<{ element: PanelModel; services?: any }> {
  protected getStateElement(): Base {
    return this.props.element;
  }
  get panel(): PanelModel {
    return this.props.element;
  }
  render() {
    const theme = getTheme();
    if (!this.panel.isVisible) return null;

    const title = this.panel.hasTitle ? (
      <Text style={[styles.panelTitle, { color: theme.colors.text }]}>
        {this.renderLocString(this.panel.locTitle)}
      </Text>
    ) : null;

    const description = this.panel.hasDescription ? (
      <Text style={[styles.panelDescription, { color: theme.colors.textLight }]}>
        {this.renderLocString(this.panel.locDescription)}
      </Text>
    ) : null;

    const errors = (
      <SurveyElementErrors errors={this.panel.errors || []} />
    );

    const rows = this.panel.visibleRows.map((row) => (
      <SurveyRow key={row.id} row={row} services={this.props.services} />
    ));

    return (
      <View style={[styles.panelCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.borderRadius.medium }]}>
        {title}
        {description}
        {errors}
        <View style={styles.panelContent}>
          {rows}
        </View>
      </View>
    );
  }
}

// ==========================================
// 6. SurveyPage
// ==========================================
export class SurveyPage extends ReactNativeSurveyElement<{ element: PageModel; services?: any }> {
  protected getStateElement(): Base {
    return this.props.element;
  }
  get page(): PageModel {
    return this.props.element;
  }
  render() {
    const theme = getTheme();
    const title = this.page.hasTitle ? (
      <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
        {this.renderLocString(this.page.locTitle)}
      </Text>
    ) : null;

    const description = this.page.hasDescription ? (
      <Text style={[styles.pageDescription, { color: theme.colors.textLight }]}>
        {this.renderLocString(this.page.locDescription)}
      </Text>
    ) : null;

    const rows = this.page.visibleRows.map((row) => (
      <SurveyRow key={row.id} row={row} services={this.props.services} />
    ));

    return (
      <View style={styles.pageContainer}>
        {title}
        {description}
        <View style={styles.pageContent}>
          {rows}
        </View>
      </View>
    );
  }
}

// ==========================================
// 7. ReactNativeSurvey (Root Survey Component)
// ==========================================
export class Survey extends ReactNativeSurveyElement<{ model: SurveyModel; services?: any; theme?: Partial<ISurveyTheme> }, { currentPage: PageModel | null; isCompleted: boolean }> {
  constructor(props: any) {
    super(props);
    if (this.props.theme) {
      setTheme(this.props.theme);
    }
    this.state = {
      currentPage: this.survey.currentPage,
      isCompleted: this.survey.state === "completed"
    };
  }

  get survey(): SurveyModel {
    return this.props.model;
  }

  protected getStateElement(): Base {
    return this.survey;
  }

  componentDidMount() {
    super.componentDidMount();
    this.survey.onCurrentPageChanged.add(this.onCurrentPageChangedHandler);
    this.survey.onComplete.add(this.onCompleteHandler);
    this.survey.renderCallback = () => {
      this.setState({
        currentPage: this.survey.currentPage,
        isCompleted: this.survey.state === "completed"
      });
    };
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.survey.onCurrentPageChanged.remove(this.onCurrentPageChangedHandler);
    this.survey.onComplete.remove(this.onCompleteHandler);
    this.survey.renderCallback = undefined;
  }

  private onCurrentPageChangedHandler = () => {
    this.setState({ currentPage: this.survey.currentPage });
  };

  private onCompleteHandler = () => {
    this.setState({ isCompleted: true });
  };

  render() {
    const theme = getTheme();
    if (this.state.isCompleted) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ScrollView contentContainerStyle={styles.centerContainer}>
            <Text style={[styles.completedText, { color: theme.colors.text }]}>
              {this.renderLocString(this.survey.locCompletedHtml) || "Thank you for completing the survey!"}
            </Text>
          </ScrollView>
        </SafeAreaView>
      );
    }

    const page = this.state.currentPage;
    if (!page) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {this.survey.title ? (
              <Text style={[styles.surveyTitle, { color: theme.colors.text }]}>
                {this.renderLocString(this.survey.locTitle)}
              </Text>
            ) : null}
            {this.survey.description ? (
              <Text style={[styles.surveyDescription, { color: theme.colors.textLight }]}>
                {this.renderLocString(this.survey.locDescription)}
              </Text>
            ) : null}
            <SurveyPage element={page} services={this.props.services} />
            {this.renderNavigationButtons()}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  private renderNavigationButtons() {
    const theme = getTheme();
    if (this.survey.isFirstPage && this.survey.firstPageIsStartPage) {
      return (
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.medium }]} onPress={() => this.survey.start()}>
            <Text style={styles.buttonText}>{this.survey.startSurveyText}</Text>
          </Pressable>
        </View>
      );
    }

    const prevBtn = !this.survey.isFirstPage ? (
      <Pressable style={[styles.button, styles.prevButton, { borderColor: theme.colors.border, borderRadius: theme.borderRadius.medium }]} onPress={() => this.survey.prevPage()}>
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>{this.survey.pagePrevText}</Text>
      </Pressable>
    ) : null;

    const nextBtn = !this.survey.isLastPage ? (
      <Pressable style={[styles.button, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.medium }]} onPress={() => this.survey.nextPage()}>
        <Text style={styles.buttonText}>{this.survey.pageNextText}</Text>
      </Pressable>
    ) : (
      <Pressable style={[styles.button, { backgroundColor: theme.colors.success, borderRadius: theme.borderRadius.medium }]} onPress={() => this.survey.completeLastPage()}>
        <Text style={styles.buttonText}>{this.survey.completeText}</Text>
      </Pressable>
    );

    return (
      <View style={styles.buttonContainer}>
        {prevBtn}
        {nextBtn}
      </View>
    );
  }
}

// ==========================================
// Registrations
// ==========================================
ReactNativeElementFactory.Instance.registerElement("survey", (props) => <Survey {...props} />);
ReactNativeElementFactory.Instance.registerElement("page", (props) => <SurveyPage {...props} />);
ReactNativeElementFactory.Instance.registerElement("panel", (props) => <SurveyPanel {...props} />);
ReactNativeElementFactory.Instance.registerElement("row", (props) => <SurveyRow {...props} />);
ReactNativeElementFactory.Instance.registerElement("question", (props) => <SurveyQuestion {...props} />);

// ==========================================
// Styles
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContainer: {
    padding: 16
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  surveyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8
  },
  surveyDescription: {
    fontSize: 14,
    marginBottom: 16
  },
  pageContainer: {
    marginVertical: 8
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8
  },
  pageDescription: {
    fontSize: 14,
    marginBottom: 12
  },
  pageContent: {
    gap: 8
  },
  rowContainer: {
    gap: 8,
    marginVertical: 4
  },
  rowHorizontal: {
    flexDirection: "row"
  },
  rowVertical: {
    flexDirection: "column"
  },
  rowElement: {
    flex: 1
  },
  panelCard: {
    padding: 12,
    borderWidth: 1,
    marginVertical: 4
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4
  },
  panelDescription: {
    fontSize: 13,
    marginBottom: 8
  },
  panelContent: {
    gap: 8
  },
  questionCard: {
    padding: 16,
    borderWidth: 1,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4
  },
  questionDescription: {
    fontSize: 13,
    marginBottom: 8
  },
  questionBody: {
    marginVertical: 8
  },
  commentContainer: {
    marginTop: 12
  },
  commentTitle: {
    fontSize: 13
  },
  textInput: {
    borderWidth: 1,
    padding: 10,
    height: 80,
    textAlignVertical: "top",
    fontSize: 14
  },
  errorContainer: {
    marginVertical: 4
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500"
  },
  completedText: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  prevButton: {
    borderWidth: 1,
    backgroundColor: "transparent"
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff"
  }
});
