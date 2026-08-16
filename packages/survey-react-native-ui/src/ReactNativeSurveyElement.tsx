import * as React from "react";
import { Base, LocalizableString } from "survey-core";

export class ReactNativeSurveyElement<P = {}, S = {}> extends React.Component<P, S> {
  private prevElements: Array<Base> = [];

  constructor(props: P) {
    super(props);
  }

  componentDidMount() {
    this.makeBaseElementsReactive();
  }

  componentWillUnmount() {
    this.unMakeBaseElementsReactive(this.prevElements);
  }

  componentDidUpdate() {
    const currentElements = this.getStateElements();
    // Unsubscribe from elements that are no longer in our state
    const obsolete = this.prevElements.filter(el => !currentElements.includes(el));
    this.unMakeBaseElementsReactive(obsolete);
    
    // Subscribe to new current elements
    this.makeBaseElementsReactive();
  }

  protected getStateElements(): Array<Base> {
    const el = this.getStateElement();
    return el ? [el] : [];
  }

  protected getStateElement(): Base | null {
    return null;
  }

  private propertyValueChangedHandler = (sender: Base, options: any) => {
    this.setState((state: any) => {
      return { ...state, [options.name]: options.newValue };
    });
    // In case local state doesn't trigger, force refresh
    this.forceUpdate();
  };

  private arrayChangedHandler = (sender: Base, options: any) => {
    this.setState((state: any) => {
      return { ...state, [options.name]: options.newValue };
    });
    this.forceUpdate();
  };

  private makeBaseElementsReactive() {
    const current = this.getStateElements();
    current.forEach((element) => {
      if (element && !this.prevElements.includes(element)) {
        element.addOnPropertyValueChangedCallback(this.propertyValueChangedHandler);
        element.addOnArrayChangedCallback(this.arrayChangedHandler);
      }
    });
    this.prevElements = current;
  }

  private unMakeBaseElementsReactive(elements: Array<Base>) {
    elements.forEach((element) => {
      if (element) {
        element.removeOnPropertyValueChangedCallback(this.propertyValueChangedHandler);
        element.removeOnArrayChangedCallback(this.arrayChangedHandler);
      }
    });
    this.prevElements = this.prevElements.filter(el => !elements.includes(el));
  }

  protected renderLocString(locStr: LocalizableString): string {
    if (!locStr) return "";
    return locStr.renderedHtml || locStr.text || "";
  }
}
