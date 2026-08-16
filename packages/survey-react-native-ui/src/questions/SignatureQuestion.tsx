import * as React from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { QuestionSignaturePadModel } from "survey-core";
import { ReactNativeSurveyElement } from "../ReactNativeSurveyElement";
import { ReactNativeQuestionFactory } from "../ReactNativeFactories";
import { getTheme } from "../theme";

export class SignatureQuestion extends ReactNativeSurveyElement<{ question: QuestionSignaturePadModel; services?: any }, { loading: boolean }> {
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

  private async captureSignature() {
    const services = this.props.services;
    if (!services || !services.signature) {
      console.warn("Signature capture service is not injected.");
      return;
    }

    this.setState({ loading: true });
    try {
      const signatureDataUrl = await services.signature.captureSignature();
      if (signatureDataUrl) {
        this.question.value = signatureDataUrl;
      }
    } catch (err) {
      console.error("Error capturing signature:", err);
    } finally {
      this.setState({ loading: false });
    }
  }

  private clearSignature() {
    if (this.question.isInputReadOnly) return;
    this.question.clearValue();
  }

  render() {
    const theme = getTheme();
    const question = this.question;
    const isReadOnly = question.isInputReadOnly;
    const value = question.value;

    if (value) {
      return (
        <View style={styles.container}>
          <View style={[styles.previewContainer, { borderColor: theme.colors.border, borderRadius: theme.borderRadius.medium }]}>
            <Image
              source={{ uri: value }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
          </View>
          {!isReadOnly && (
            <Pressable
              onPress={() => this.clearSignature()}
              style={[styles.clearButton, { borderColor: theme.colors.error, borderRadius: theme.borderRadius.medium }]}
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
                borderRadius: theme.borderRadius.medium
              }
            ]}
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  previewContainer: {
    borderWidth: 1,
    height: 150,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  signatureImage: {
    width: "100%",
    height: "100%"
  },
  clearButton: {
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "bold"
  },
  signButton: {
    borderWidth: 1,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed"
  },
  signButtonText: {
    fontSize: 15,
    fontWeight: "bold"
  },
  emptyContainer: {
    height: 100,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center"
  }
});

// We register both "signaturepad" (used in SurveyJS models) and "signature" just in case
ReactNativeQuestionFactory.Instance.registerQuestion("signaturepad", (props) => (
  <SignatureQuestion {...props} />
));
ReactNativeQuestionFactory.Instance.registerQuestion("signature", (props) => (
  <SignatureQuestion {...props} />
));
