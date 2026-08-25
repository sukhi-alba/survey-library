import * as React from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator, Modal, SafeAreaView } from "react-native";
import { QuestionFileModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";
import { pick } from "@react-native-documents/picker";
import ImagePicker from "react-native-image-crop-picker";

export class FileQuestion extends ReactNativeSurveyElement<
  { question: QuestionFileModel, services?: any },
  { loading: boolean, pickerModalVisible: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { loading: false, pickerModalVisible: false };
  }

  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  private async pickFiles() {
    const services = this.props.services;
    const question = this.question;

    this.setState({ loading: true, pickerModalVisible: false });
    try {
      let files: any[] = [];
      if (services && services.filePicker) {
        files = await services.filePicker.pickFiles();
      } else {
        // Fallback: Use the modern @react-native-documents/picker library
        const results = await pick({
          allowMultiSelection: question.allowMultiple,
          type: ["*/*"],
        });
        if (results && results.length > 0) {
          files = results.map((f) => ({
            name: f.name,
            type: f.type,
            uri: f.uri,
            content: f.uri,
          }));
        }
      }

      if (files && files.length > 0) {
        const formattedFiles = files.map((file: any) => ({
          name: file.name,
          type: file.type,
          content: file.content || file.uri,
        }));

        this.addFilesToQuestion(formattedFiles);
      }
    } catch(err: any) {
      // Gracefully handle cancellation errors from document picker
      const isCancel =
        err &&
        (err.code === "DOCUMENT_PICKER_CANCELED" ||
          err.message === "User canceled directory picker" ||
          String(err).includes("canceled"));
      if (!isCancel) {
        // eslint-disable-next-line no-console
        console.error("Error picking files:", err);
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  private async launchCamera() {
    this.setState({ loading: true, pickerModalVisible: false });
    try {
      const image: any = await ImagePicker.openCamera({
        includeBase64: true,
        compressImageQuality: 0.8,
      });
      if (image) {
        const filename = image.filename || image.path.substring(image.path.lastIndexOf("/") + 1);
        const formattedFile = {
          name: filename,
          type: image.mime,
          content: image.data ? `data:${image.mime};base64,${image.data}` : image.path,
        };
        this.addFilesToQuestion([formattedFile]);
      }
    } catch(err: any) {
      // Ignore normal camera cancel errors
      if (!String(err).includes("cancel")) {
        // eslint-disable-next-line no-console
        console.error("Error launching camera:", err);
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  private async launchImageLibrary() {
    const question = this.question;
    this.setState({ loading: true, pickerModalVisible: false });
    try {
      const selection = await ImagePicker.openPicker({
        multiple: question.allowMultiple,
        includeBase64: true,
        compressImageQuality: 0.8,
      });

      const images = Array.isArray(selection) ? selection : [selection];
      const formattedFiles = images.map((image: any) => {
        const filename = image.filename || image.path.substring(image.path.lastIndexOf("/") + 1);
        return {
          name: filename,
          type: image.mime,
          content: image.data ? `data:${image.mime};base64,${image.data}` : image.path,
        };
      });

      this.addFilesToQuestion(formattedFiles);
    } catch(err: any) {
      // Ignore normal library cancel errors
      if (!String(err).includes("cancel")) {
        // eslint-disable-next-line no-console
        console.error("Error launching gallery:", err);
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  private addFilesToQuestion(formattedFiles: any[]) {
    const question = this.question;
    if (question.allowMultiple) {
      question.value = (question.value || []).concat(formattedFiles);
    } else {
      question.value = formattedFiles[0];
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
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.name}`}
            >
              <Text style={[styles.removeButtonText, { color: theme.colors.error }]}>{"\u2715"}</Text>
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
            onPress={() => this.setState({ pickerModalVisible: true })}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: pressed ? theme.colors.accent : "transparent",
                borderColor: theme.colors.primary,
                borderRadius: theme.borderRadius.medium,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Choose files or capture photo"
          >
            {this.state.loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Choose File / Image
              </Text>
            )}
          </Pressable>
        )}

        {/* Modal selection sheet for Camera, Gallery or Documents */}
        <Modal
          visible={this.state.pickerModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.setState({ pickerModalVisible: false })}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => this.setState({ pickerModalVisible: false })}
          >
            <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                Select Upload Source
              </Text>

              <Pressable
                style={[styles.sheetOption, { borderBottomColor: theme.colors.border }]}
                onPress={() => this.launchCamera()}
              >
                <Text style={[styles.sheetOptionText, { color: theme.colors.primary }]}>
                  Camera (Take Photo)
                </Text>
              </Pressable>

              <Pressable
                style={[styles.sheetOption, { borderBottomColor: theme.colors.border }]}
                onPress={() => this.launchImageLibrary()}
              >
                <Text style={[styles.sheetOptionText, { color: theme.colors.primary }]}>
                  Photo Library (Gallery)
                </Text>
              </Pressable>

              <Pressable
                style={[styles.sheetOption, { borderBottomColor: theme.colors.border }]}
                onPress={() => this.pickFiles()}
              >
                <Text style={[styles.sheetOptionText, { color: theme.colors.primary }]}>
                  Browse Documents (Files)
                </Text>
              </Pressable>

              <Pressable
                style={[styles.sheetOption, styles.cancelOption]}
                onPress={() => this.setState({ pickerModalVisible: false })}
              >
                <Text style={[styles.sheetOptionText, { color: theme.colors.error }]}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  listContainer: {
    gap: 8,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: 4,
    marginRight: 10,
  },
  fileIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeButton: {
    padding: 6,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButton: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    gap: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  sheetOption: {
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("file", (props) => (
  <FileQuestion {...props} />
));
