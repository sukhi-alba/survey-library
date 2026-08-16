# SurveyJS React Native UI - Integration Guide

This guide details how to consume, configure, and extend the React Native rendering library for SurveyJS in your mobile applications.

---

## 1. Installation

Since this package is developed as part of your local monorepo branch, there are two primary methods to install and consume it in your React Native CLI application:

### Method A: Local Relative Dependency (Recommended for Development)
If your mobile application code is located on the same filesystem, reference the package directly by its relative path in your React Native app's `package.json`:

```json
"dependencies": {
  "survey-react-native-ui": "file:../path-to-survey-form/packages/survey-react-native-ui"
}
```
Then run:
```bash
npm install --legacy-peer-deps
```

### Method B: Package Archive (Tarball Distribution)
Generate a self-contained tarball of the package:
1. Navigate to the package directory:
   ```bash
   cd packages/survey-react-native-ui
   ```
2. Build the TypeScript definitions and bundle:
   ```bash
   npm run build
   ```
3. Generate a `.tgz` archive:
   ```bash
   npm pack
   ```
   This outputs a file named `survey-react-native-ui-3.0.0.tgz`.
4. Copy this file into your React Native application root and install it:
   ```bash
   npm install ./survey-react-native-ui-3.0.0.tgz --legacy-peer-deps
   ```

---

## 2. Basic Usage

Import the `SurveyModel` from `survey-core` (or the react-native package if exported) and render it with the `<Survey>` component:

```tsx
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { SurveyModel } from "survey-core";
import { Survey } from "survey-react-native-ui";

const surveyJson = {
  title: "User Profile Feedback",
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "text",
          name: "username",
          title: "What is your username?",
          isRequired: true
        },
        {
          type: "comment",
          name: "feedback",
          title: "Please write your comment feedback:"
        }
      ]
    }
  ]
};

export default function App() {
  // Initialize the platform-neutral survey model
  const survey = React.useMemo(() => new SurveyModel(surveyJson), []);

  React.useEffect(() => {
    survey.onComplete.add((sender) => {
      console.log("Survey completed! Data payload:", sender.data);
    });
  }, [survey]);

  return (
    <SafeAreaView style={styles.container}>
      <Survey model={survey} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  }
});
```

---

## 3. Injecting Custom Native Adapters (Services)

React Native does not contain a browser DOM. Instead of emulating web-based file uploads or HTML canvases, `<Survey>` accepts a `services` prop to delegate system file pickers, cameras, and signature pads to your native app modules (e.g. `react-native-document-picker` or `react-native-image-picker`):

```tsx
import DocumentPicker from "react-native-document-picker";

const mobileServices = {
  filePicker: {
    pickFiles: async () => {
      try {
        const results = await DocumentPicker.pick({
          type: [DocumentPicker.types.allFiles],
          allowMultiSelection: true
        });
        // Map native file metadata structures to the expected SurveyJS contract:
        return results.map(file => ({
          name: file.name,
          type: file.type,
          uri: file.uri,
          size: file.size
        }));
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          return [];
        }
        throw err;
      }
    }
  },
  signature: {
    captureSignature: async () => {
      // Open a custom modal drawing canvas in your host app
      // Return a base64 image data URL (e.g. "data:image/png;base64,...")
      return await MyCanvasDrawer.capture();
    }
  }
};

// Render
<Survey model={survey} services={mobileServices} />
```

---

## 4. Offline State Persistence

Our serialization utilities allow saving incomplete or modified offline survey states (active page and responses) directly to local storage (like `AsyncStorage` or `SQLite`):

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { serializeSurveyState, restoreSurveyState } from "survey-react-native-ui";

const STORAGE_KEY = "@offline_survey_cache";

// A. Save progress on changes
survey.onValueChanged.add((sender) => {
  const state = serializeSurveyState(sender);
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
});

// B. Load / Restore progress on mount
React.useEffect(() => {
  async function loadCachedState() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw);
      restoreSurveyState(survey, state);
    }
  }
  loadCachedState();
}, [survey]);
```

---

## 5. Registering Custom Rendering Views

If you have custom question widgets (e.g. `"location"`) defined in your SurveyJS JSON schemas, you can define and register a platform-specific React Native UI rendering element for them:

```tsx
import React from "react";
import { View, Text, TextInput } from "react-native";
import { ReactNativeQuestionFactory } from "survey-react-native-ui";

// 1. Create your React Native presentation component
function MyLocationRenderer({ question }) {
  const value = question.value || { latitude: 0, longitude: 0 };
  
  return (
    <View style={{ gap: 8, padding: 12, borderWidth: 1 }}>
      <Text>Custom Location Question</Text>
      <TextInput
        placeholder="Latitude"
        value={String(value.latitude)}
        onChangeText={(text) => {
          question.value = { ...value, latitude: parseFloat(text) || 0 };
        }}
      />
      <TextInput
        placeholder="Longitude"
        value={String(value.longitude)}
        onChangeText={(text) => {
          question.value = { ...value, longitude: parseFloat(text) || 0 };
        }}
      />
    </View>
  );
}

// 2. Register it in the factory (run this once on app startup)
ReactNativeQuestionFactory.Instance.registerQuestion("location", (props) => (
  <MyLocationRenderer {...props} />
));
```
Any occurrences of `{ "type": "location" }` in your survey schemas will now dynamically dispatch to `<MyLocationRenderer>` on mobile, while remaining fully compatible with the standard web widget on desktop.
