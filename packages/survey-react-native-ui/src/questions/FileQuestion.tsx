import * as React from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { QuestionFileModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class FileQuestion extends ReactNativeSurveyElement<{ question: QuestionFileModel, services?: any }, { loading: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { loading: false };
  }

  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  private async pickFiles() {
    const services = this.props.services;
    if (!services || !services.filePicker) {
      console.warn("File picker service is not injected.");
      return;
    }

    this.setState({ loading: true });
    try {
      const files = await services.filePicker.pickFiles();
      if (files && files.length > 0) {
        const question = this.question;
        const formattedFiles = files.map((file: any) => ({
          name: file.name,
          type: file.type,
          content: file.content || file.uri
        }));

        if (question.allowMultiple) {
          question.value = (question.value || []).concat(formattedFiles);
        } else {
          question.value = formattedFiles[0];
        }
      }
    } catch(err) {
      console.error("Error picking files:", err);
    } finally {
      this.setState({ loading: false });
    }
  }

  private removeFile(itemToRemove: any) {
    const question = this.question;
    if (question.isInputReadOnly) return;

    if (Array.isArray(question.value)) {
      question.value = question.value.filter((item: any) => item.name !== itemToRemove.name);
    } else if (question.value && question.value.name === itemToRemove.name) {
      question.value = undefined;
    }
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const isReadOnly = question.isInputReadOnly;

    // Convert value to list of preview items
    let fileItems: any[] = [];
    if (Array.isArray(question.value)) {
      fileItems = question.value;
    } else if (question.value) {
      fileItems = [question.value];
    }

    const fileList = fileItems.map((item, index) => {
      const isImage = item.type && item.type.startsWith("image/");
      return (
        <View key={index} style={[styles.fileRow, { borderColor: theme.colors.border }]}>
          {isImage ? (
            <Image source={{ uri: item.content }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.fileIconPlaceholder, { backgroundColor: theme.colors.background }]}>
              <Text style={{ fontSize: 10, color: theme.colors.textLight }}>FILE</Text>
            </View>
          )}
          <View style={styles.fileDetails}>
            <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          {!isReadOnly && (
            <Pressable
              onPress={() => this.removeFile(item)}
              style={styles.removeButton}
            >
              <Text style={[styles.removeButtonText, { color: theme.colors.error }]}>✕</Text>
            </Pressable>
          )}
        </View>
      );
    });

    return (
      <View style={styles.container}>
        {fileList.length > 0 && <View style={styles.listContainer}>{fileList}</View>}

        {!isReadOnly && (
          <Pressable
            disabled={this.state.loading}
            onPress={() => this.pickFiles()}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: pressed ? theme.colors.accent : "transparent",
                borderColor: theme.colors.primary,
                borderRadius: theme.borderRadius.medium
              }
            ]}
          >
            {this.state.loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                {question.allowMultiple ? "Choose Files" : "Choose File"}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  listContainer: {
    gap: 8
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 8,
    borderRadius: 6
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: 4,
    marginRight: 10
  },
  fileIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  fileDetails: {
    flex: 1
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500"
  },
  removeButton: {
    padding: 6
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  actionButton: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "bold"
  }
});

ReactNativeQuestionFactory.Instance.registerQuestion("file", (props) => (
  <FileQuestion {...props} />
));
