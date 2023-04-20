import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationNL from "./locales/nl.json";

const resources = {
    nl: {
        translation: translationNL,
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: "nl", // set the default language here
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
