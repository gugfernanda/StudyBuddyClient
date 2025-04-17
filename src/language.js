
import { ref } from 'vue';

const lang = ref(localStorage.getItem("lang") || "en");

export function useLanguage() {
  function setLang(newLang) {
    lang.value = newLang;
    localStorage.setItem("lang", newLang);
  }

  return { lang, setLang };
}
