# @datawheel/use-translation

A react-i18next compatible translation hook for componentized applications.

[![npm package](https://img.shields.io/npm/v/@datawheel/use-translation.svg)](https://www.npmjs.com/package/@datawheel/use-translation)

## Installation

```bash
npm install @datawheel/use-translation
```

## Usage

This package exports a factory function to generate a React Context to handle 
the translation in your components. The factory function generates the 
`Provider` and `Consumer` components, and the `useTranslation` hook, for use 
with React:

```js
// src/locale/index.js
import {translationFactory} from "@datawheel/use-translation";
import labels_en from "./labels_en";
import labels_es from "./labels_es";

export const translationDicts = {
  es: labels_es,
  en: labels_en
};

export const {
  TranslationConsumer,
  TranslationProvider,
  useTranslation,
  withTranslation
} = translationFactory({defaultLocale: "en", defaultTranslation: labels_en});
```

You must then wrap your app with the `TranslationProvider` component. 
The defaults provided to the `translationFactory` are intended for fallback use,
and are overridden by the properties passed to the `TranslationProvider`; 
this way you can load translations asynchronously, or by properties passed to 
your app.

```jsx
// src/App.jsx
import React from "react";
import {Toolbar} from "./components/Toolbar";
import {TranslationProvider, translationDicts} from "./locale/";

const App = props => {
  {...}
  return (
    <TranslationProvider
      defaultLocale={props.defaultUiLocale || "en"}
      translations={translationDicts}
    >
      <div className="app-wrapper">
        <Toolbar />
        {...}
      </div>
    </TranslationProvider>
  );
};

export default App;
```

This enables the use of the `useTranslation` hook in functional components, and the `TranslationConsumer` component in class components:

```jsx
// src/components/Toolbar
import React from "react";
import {useTranslation, TranslationConsumer} from "../locale/";

// For functional components
export const Toolbar = props => {
  const {translate: t} = useTranslation();

  return (
    <div className="toolbar">
      <button onClick={...}>{t("action_create")}</button>
      {...}
    </div>
  );
};

// For class components
export class Toolbar extends React.Component {
  render() {
    return (
      // TranslationConsumer's child must be a function, whose first parameter
      // is the same object returned by the useTranslation hook
      <TranslationConsumer>
        {({translate: t}) => (
          <div className="toolbar">
            <button onClick={...}>{t("action_create")}</button>
            {...}
          </div>
        )}
      </TranslationConsumer>
    );
  }
}
```

Both the `useTranslation` hook and the `TranslationConsumer` component make a 
`TranslationContextProps` object available to the user to interact with the 
translator where needed:

```ts
interface TranslationContextProps {
  /**
   * A list of the locales currently available to the Translation Context.
   */
  availableLocale: readonly string[];

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
  t: TranslateFunction; // alias for `translate`

  /**
   * The currently active locale.
   */
  locale: string;
}
```

Alternatively you can use the `withTranslation` HOC function to wrap your component, which will pass the `TranslationContextProps` props to it along with
the properties passed by its parent.

```tsx
import React from "react";
import {WithTranslationProps} from "@datawheel/use-translation";
import {Toolbar} from "./components/Toolbar";
import {withTranslation} from "./locale/";

type IProps = {
  isOpen: boolean;
}

const Unwrapped: React.FC<IProps & WithTranslationProps> = props => {
  const {t} = props;
  return (
    <div className="component">
      <Toolbar isOpen={props.isOpen} label={t("toolbar.label")} />
    </div>
  );
};

// `withTranslation` strips `WithTranslationProps` from the expected props
const Wrapped: React.FC<IProps> = withTranslation(Unwrapped);

const App = (props) => 
  <TranslationProvider
    defaultLocale={props.defaultLocale || "en"}
    translations={translationDicts}
  >
    <div className="app">
      {/* Checks out */}
      <Wrapped a={true} />
    </div>
  </TranslationProvider>
```

## License

© 2023 [Datawheel](https://datawheel.us/)  
Licensed under MIT
