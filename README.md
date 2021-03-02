# @datawheel/use-translation

A react-i18next compatible translation hook for componentized applications.

[![npm package](https://img.shields.io/npm/v/@datawheel/use-translation.svg)](https://www.npmjs.com/package/@datawheel/use-translation)

## Installation

```bash
npm install @datawheel/use-translation
```

## Usage

This package exports a factory function to generate a React Context to handle the translation in your components. The factory function generates the `Provider` and `Consumer` components, and the `useTranslation` hook, for use with React:

```js
// src/locale/index.js
import {translationFactory} from "@datawheel/use-translation";
import labels_en from "./labels_en";
import labels_es from "./labels_es";

export const translations = {
  es: labels_es,
  en: labels_en
};

const translator = translationFactory({
  defaultLocale: "en",
  defaultTranslation: labels_en
});

export const {useTranslation, TranslationConsumer, TranslationProvider} = translator;
```

You must then wrap your app with the `TranslationProvider` component. The defaults provided to the `translationFactory` are intended for fallback use, and are overridden by the properties passed to the `TranslationProvider`; this way you can load translations asynchronously, or by properties passed to your app.

```jsx
// src/App.jsx
import React from "react";
import {Toolbar} from "./components/Toolbar";
import {TranslationProvider, translations} from "./locale/";

const App = props => {
  {...}
  return (
    <TranslationProvider
      defaultLocale={props.defaultLocale || "en"}
      translations={translations}
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

Both the `useTranslation` hook and the `TranslationConsumer` component make a `TranslationContextProps` object available to the user to interact with the translator where needed:

```ts
interface TranslationContextProps {
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
```

## License

MIT © 2021 [Datawheel](https://datawheel.us/)
