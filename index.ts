import { getPathInfo, hasProperty } from "pathval";
import React, { createContext, createElement, useContext, useMemo, useState } from "react";

interface FactoryOptions {
  /**
   * This property sets the default labels which your app will use if a
   * defaultLocale is not set, or if the locale code set afterwards is not
   * present in the translation dictionary.  
   * If it's not defined, and during runtime a locale code not present in the 
   * translation dictionary is set, the TranslationProvider will throw an error.
   */
  defaultTranslation: TranslationDict;

  /**
   * This property sets the locale code used by the app on startup.  
   * The app can change it later by calling the `setLocale` function from the
   * TranslationContextProps object.
   */
  defaultLocale: string;
}

interface FactoryOutput {
  /**
   * Use this component in a class component to interact with the translator.  
   * The child of this component must be a function, which will receive the
   * TranslationContextProps object as the first argument.
   */
  TranslationConsumer: React.FC<React.ConsumerProps<TranslationContextProps>>;

  /**
   * Wrap your app with this component to make a TranslationContextProps object
   * available to any child.
   */
  TranslationProvider: React.FC<TranslationProviderProps>;

  /**
   * Use this hook in a functional component to interact with the translator.  
   * Calling it will return a TranslationContextProps object.
   */
  useTranslation(): TranslationContextProps;

  /**
   * Creates a HOC where the wrapped Component is provided with the current
   * TranslationContextProps. For use with `React.Component` subclasses.
   */
  withTranslation<T extends {}>(Component: React.ComponentType<T & WithTranslationProps>): React.FC<T>;
}

/**
 * Returns the labels requested in the locale currently set by the app.
 * 
 * @param template
 * Defines the path in the TranslationDict to get the label.
 * Nested keys can be accessed using dot notation.
 * @param data
 * Defines the data to interpolate in the label, if it's a template.
 * 
 * @example
 * // TranslationDict
 * {
 *   foo: "bar",
 *   template: "{word} value",
 *   template_plural: "{word} values",
 *   nested: {
 *     key: "this is a nested value"
 *   }
 * }
 * 
 * t("foo") // "bar"
 * t("template", {word: "unique"}) // "unique value"
 * t("template", {word: "multiple", n: 2}) // "multiple values"
 * t("nested.key") // "this is a nested value"
 */
export interface TranslateFunction {
  (template: string, data?: Record<string, any>): string;
}

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export interface TranslationContextProps {
  /**
   * Changes the locale currently used.
   * The locale code passed must match with a locale key in the translations dictionary.
   * Calling it triggers a render on everything under the TranslationProvider.
   */
  setLocale: (lang: string) => void;

  /**
   * The main translate function.
   * Retrieves the labels from the translation dictionary in the current locale.
   */
  translate: TranslateFunction;

  /**
   * The currently active locale.
   */
  locale: string;
}

export interface TranslationProviderProps {
  /**
   * Sets the default locale to use in the app.
   * It's not necesary to use a real ISO 639 code, you can use any key you want.
   */
  defaultLocale?: string;

  /**
   * Defines the translation dictionary.
   * The keys of this object are the locale codes you will use within your app,
   * and its values are the TranslationDicts for these codes.
   */
  translations?: Record<string, TranslationDict>;
}

export interface WithTranslationProps extends TranslationContextProps {}

export function translationFactory(options: Partial<FactoryOptions>): FactoryOutput {
  const TranslationContext: React.Context<TranslationContextProps | undefined> = createContext(undefined);

  const TranslationProvider: React.FC<TranslationProviderProps> = (props) => {
    const [locale, setLocale] = useState(props.defaultLocale || options.defaultLocale);

    const translate: TranslateFunction = useMemo(() => {
      const { translations = {} } = props;
      if (!options.defaultTranslation && !hasProperty(translations, locale)) {
        throw new Error(`Translation dictionary for locale "${locale}" not provided.`);
      }
      return translateFunctionFactory(translations[locale] || options.defaultTranslation);
    }, [locale]);

    return createElement(
      TranslationContext.Provider,
      { value: { locale, setLocale, translate } },
      props.children
    );
  };

  function useTranslation(): TranslationContextProps {
    const context = useContext(TranslationContext);
    if (context === undefined) {
      throw new Error("useTranslation must be used within a TranslationProvider.");
    }
    return context;
  }

  return {
    TranslationProvider,

    TranslationConsumer: (props) =>
      createElement(TranslationContext.Consumer, undefined, (context) => {
        if (context === undefined) {
          throw new Error("TranslationConsumer must be used within a TranslationProvider.");
        }
        return props.children(context);
      }),

    useTranslation,

    withTranslation<T extends {}>(Component: React.ComponentType<T & WithTranslationProps>) {
      const WithTranslation: React.FC<T> = (props) => {
        const context = useTranslation();
        return createElement(Component, { ...context, ...props as T }, props.children);
      };
      WithTranslation.displayName = `${Component.displayName || Component["name"]}WithTranslation`;
      return WithTranslation;
    },
  };
}

export function translateFunctionFactory(dictionary: TranslationDict): TranslateFunction {
  const alterTemplates = (path, data) => {
    const n = data ? data.n : undefined;
    if (n != null) {
      const { name, parent } = path;
      if (n == 0 && hasProperty(parent, `${name}_zero`)) {
        return parent[`${name}_zero`];
      }
      // using <> instead of != does an implicit .valueOf()
      if ((n > 1 || n < 1) && hasProperty(parent, `${name}_plural`)) {
        return parent[`${name}_plural`];
      }
    }
    return path.value;
  };
  
  const braceRegex = /{{1,2}(\d+|[a-z$_][a-z\d$_]*?(?:\.[a-z\d$_]*?)*?)}{1,2}/gi

  return (template, data) => {
    const path = getPathInfo(dictionary, template);
    const string = !path.exists ? template : alterTemplates(path, data);
    return !data ? string : `${string}`.replace(braceRegex, (_, key) => `${data[key] ?? ""}`);
  };
}
