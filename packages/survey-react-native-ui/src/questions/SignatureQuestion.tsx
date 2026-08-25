import * as React from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator, Modal, SafeAreaView } from "react-native";
import { QuestionSignaturePadModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";
import SignatureCanvas from "react-native-signature-canvas";

export class SignatureQuestion extends ReactNativeSurveyElement<
  { question: QuestionSignaturePadModel, services?: any },
  { loading: boolean, modalVisible: boolean }
> {
  private canvasRef = React.createRef<any>();

  constructor(props: any) {
    super(props);
    this.state = { loading: false, modalVisible: false };
  }

  protected getStateElement() {
    return this.props.question;
  }
  get question() {
    return this.props.question;
  }

  private async captureSignature() {
    const services = this.props.services;
    if (services && services.signature) {
      this.setState({ loading: true });
      try {
        const signatureDataUrl = await services.signature.captureSignature();
        if (signatureDataUrl) {
          this.question.value = signatureDataUrl;
        }
      } catch(err) {
        // eslint-disable-next-line no-console
        console.error("Error capturing signature via service:", err);
      } finally {
        this.setState({ loading: false });
      }
    } else {
      // Fallback: Open the built-in modal drawing board
      this.setState({ modalVisible: true });
    }
  }

  private clearSignature() {
    if (this.question.isInputReadOnly) return;
    this.question.clearValue();
  }

  private handleSave = (signature: string) => {
    // signature is a base64 PNG data URL string
    this.question.value = signature;
    this.setState({ modalVisible: false });
  };

  private handleClear = () => {
    if (this.canvasRef.current) {
      this.canvasRef.current.clearSignature();
    }
  };

  private triggerSave = () => {
    if (this.canvasRef.current) {
      this.canvasRef.current.readSignature();
    }
  };

  render() {
    const theme = getTheme();
    const question = this.question;
    const isReadOnly = question.isInputReadOnly;
    const value = question.value;

    if (value) {
      return (
        <View style={styles.container}>
          <View
            style={[
              styles.previewContainer,
              { borderColor: theme.colors.border, borderRadius: theme.borderRadius.medium },
            ]}
          >
            <Image source={{ uri: value }} style={styles.signatureImage} resizeMode="contain" />
          </View>
          {!isReadOnly && (
            <Pressable
              onPress={() => this.clearSignature()}
              style={[
                styles.clearButton,
                { borderColor: theme.colors.error, borderRadius: theme.borderRadius.medium },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Clear Signature"
            >
              <Text style={[styles.clearButtonText, { color: theme.colors.error }]}>
                Clear Signature
              </Text>
            </Pressable>
          )}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {!isReadOnly && (
          <Pressable
            disabled={this.state.loading}
            onPress={() => this.captureSignature()}
            style={({ pressed }) => [
              styles.signButton,
              {
                borderColor: theme.colors.primary,
                backgroundColor: pressed ? theme.colors.accent : "transparent",
                borderRadius: theme.borderRadius.medium,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Tap to sign"
          >
            {this.state.loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.signButtonText, { color: theme.colors.primary }]}>
                Tap to Sign
              </Text>
            )}
          </Pressable>
        )}
        {isReadOnly && (
          <View style={[styles.emptyContainer, { borderColor: theme.colors.border }]}>
            <Text style={{ color: theme.colors.placeholder }}>No signature provided</Text>
          </View>
        )}

        {/* Modal signature capture drawing board */}
        <Modal
          visible={this.state.modalVisible}
          transparent={false}
          animationType="slide"
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Draw Your Signature
              </Text>
              <Pressable
                onPress={() => this.setState({ modalVisible: false })}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close drawing modal"
              >
                <Text style={[styles.closeButtonText, { color: theme.colors.textLight }]}>
                  {"\u2715"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.canvasContainer}>
              <SignatureCanvas
                ref={this.canvasRef}
                onOK={this.handleSave}
                descriptionText=""
                clearText=""
                confirmText=""
                webStyle={`
                  .m-signature-pad--footer { display: none !important; }
                  .m-signature-pad { box-shadow: none !important; border: none !important; }
                  body, html { background-color: #ffffff !important; }
                `}
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={this.handleClear}
                style={[
                  styles.footerButton,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Clear drawing"
              >
                <Text style={[styles.footerButtonText, { color: theme.colors.text }]}>
                  Clear
                </Text>
              </Pressable>
              <Pressable
                onPress={this.triggerSave}
                style={[styles.footerButton, { backgroundColor: theme.colors.primary }]}
                accessibilityRole="button"
                accessibilityLabel="Save signature"
              >
                <Text style={[styles.footerButtonText, { color: "#ffffff" }]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  previewContainer: {
    borderWidth: 1,
    height: 150,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  signatureImage: {
    width: "100%",
    height: "100%",
  },
  clearButton: {
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  signButton: {
    borderWidth: 1,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
  },
  signButtonText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  emptyContainer: {
    height: 100,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

ReactNativeQuestionFactory.Instance.registerQuestion("signaturepad", (props) => (
  <SignatureQuestion {...props} />
));
ReactNativeQuestionFactory.Instance.registerQuestion("signature", (props) => (
  <SignatureQuestion {...props} />
));
