import { HashTable } from "survey-core";
import * as React from "react";

export class ReactNativeQuestionFactory {
  public static Instance: ReactNativeQuestionFactory = new ReactNativeQuestionFactory();
  private creatorHash: HashTable<(props: any) => React.JSX.Element> = {};

  public registerQuestion(
    questionType: string,
    questionCreator: (props: any) => React.JSX.Element
  ) {
    this.creatorHash[questionType] = questionCreator;
  }

  public getAllTypes(): Array<string> {
    const result: string[] = [];
    for (const key in this.creatorHash) {
      result.push(key);
    }
    return result.sort();
  }

  public createQuestion(questionType: string, props: any): React.JSX.Element | null {
    const creator = this.creatorHash[questionType];
    if (creator == null) return null;
    return creator(props);
  }
}

export class ReactNativeElementFactory {
  public static Instance: ReactNativeElementFactory = new ReactNativeElementFactory();
  private creatorHash: HashTable<(props: any) => React.JSX.Element> = {};

  public registerElement(
    elementType: string,
    elementCreator: (props: any) => React.JSX.Element
  ) {
    this.creatorHash[elementType] = elementCreator;
  }

  public getAllTypes(): Array<string> {
    const result: string[] = [];
    for (const key in this.creatorHash) {
      result.push(key);
    }
    return result.sort();
  }

  public isElementRegistered(elementType: string): boolean {
    return !!this.creatorHash[elementType];
  }

  public createElement(elementType: string, props: any): React.JSX.Element | null {
    const creator = this.creatorHash[elementType];
    if (creator == null) return null;
    return creator(props);
  }
}
