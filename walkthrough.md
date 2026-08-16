# React Native Rendering Support for SurveyJS - Walkthrough

We have successfully designed, implemented, and verified **React Native rendering support** for the SurveyJS Form Library. A new, fully isolated package `packages/survey-react-native-ui` has been introduced without modifying the web rendering target or risking regressions in existing web workflows.

---

## 1. Component Architecture & Reactivity

The package implements a framework-specific renderer matching the architecture of the SurveyJS React Web renderer:

- **Reactivity Bridge (`ReactNativeSurveyElement`)**:
  Interceptors bind to the underlying `Base` model of `survey-core` using `addOnPropertyValueChangedCallback` and `addOnArrayChangedCallback` listeners. Any model-level calculations (validations, expression outcomes, visibility triggers) notify the listener to update the local React Native state and force re-renders.
- **Factory Resolvers**:
  `ReactNativeElementFactory` and `ReactNativeQuestionFactory` dynamically look up elements and inputs by name (e.g., `"text"`, `"dropdown"`), allowing decoupling and seamless extensibility for custom types.
- **Structural Layout Layouts**:
  - `Survey`: Connects model lifecycle updates (navigation, completion) and Table of Contents (TOC).
  - `SurveyPage`: Wraps layout in `<KeyboardAvoidingView>` and `<ScrollView>`.
  - `SurveyRow` / `SurveyRowElement`: Draws multi-element grid lines using native flex wraps.
  - `SurveyQuestion`: The structural wrapper for question titles, description labels, and error rows.

---

## 2. Injected Native Services (Adapters)

To prevent native compile-time dependencies, the `<Survey>` component consumes native file picker, camera, and signature drawing systems via dependency-injected services:

```typescript
const myServices = {
  filePicker: {
    pickFiles: async () => [
      { name: "invoice.pdf", type: "application/pdf", uri: "file://..." }
    ]
  },
  signature: {
    captureSignature: async () => "data:image/png;base64,..."
  }
};

<Survey model={survey} services={myServices} />
```

---

## 3. Supported Question Types

We have implemented native layouts for all 10 initial question types, plus nested custom configurations:

1. **Text**: `<TextInput>` matching schema configurations (numeric, passwords, email types).
2. **Comment**: Multiline inputs with custom layouts.
3. **Checkbox**: Multi-select option list with check indicators.
4. **Radio**: Single-select option list with outer/inner circle radio dots.
5. **Dropdown**: Touch selector button triggering a full-screen selection `<Modal>` list.
6. **Expression**: Calculated value strings rendered as standard native text.
7. **PanelDynamic**:
   - Supports both `List` mode (all panels stacked) and `Progress/Navigation` mode (paginated panel viewer with next/prev pagination bar).
   - Synchronizes validation checks and panel count edits (adding/removing panels).
8. **File**: Files list displaying image previews, file extensions, and remove tags.
9. **Image**: Renders target URLs with bounds defined in JSON.
10. **Signature**: Captures stroke paths, saves data URL base64 hashes, and renders preview images.
11. **Custom/Composite Wrapper**: Delegates nested custom widget components.
12. **Location Custom Question**: Coordinate input fields mapping custom `latitude` and `longitude` properties.

---

## 4. Styling and Offline States

- **Theme System (`theme.ts`)**: Custom tokens for brand colors, text sizes, rounded edges, and padding margins.
- **Offline Sync Helpers (`offline.ts`)**: Exposes `serializeSurveyState` and `restoreSurveyState` to serialize the current `survey.data` response object and active page indexes.

---

## 5. Verification & Test Results

### A. React Native Package Unit Tests
A comprehensive test suite was written in `packages/survey-react-native-ui/tests/survey.test.tsx` verifying:
- Model Loading / Rendering.
- Text Question value updates & data sync.
- Checkbox multi-select value updates.
- Expression computed values.
- PanelDynamic addition & removal nested changes.
- Offline saving & loading state.
- Location custom question registration/rendering.

**Test Execution Output**:
```bash
npx vitest run packages/survey-react-native-ui/tests/survey.test.tsx
```
```
 RUN  v4.1.10 C:/Users/Ricky/Documents/oceanaut/survey-form

 ✓ packages/survey-react-native-ui/tests/survey.test.tsx (7 tests) 173ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  17:36:31
   Duration  3.21s (transform 2.35s, setup 0ms, import 2.87s, tests 173ms, environment 0ms)
```
**Status: 100% PASSED**

### B. Core Web Regression Suite
To guarantee that the native additions caused zero side-effects on existing web logic, the full core test suite was executed:
```bash
npm run test --prefix packages/survey-core
```
**Test Execution Output**:
```
 Test Files  96 passed (96)
      Tests  4509 passed | 4 skipped (4513)
   Start at  17:36:46
   Duration  122.08s
```
**Status: 100% PASSED (0 regressions detected)**
