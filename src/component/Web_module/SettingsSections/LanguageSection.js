import { useLanguage } from "../../../context/LanguageContext";

function LanguageSection({ text }) {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    // Save to localStorage
    localStorage.setItem("appLanguage", newLanguage);
  };

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
          <i className="fas fa-language text-primary" />
          <span>{text.languageSectionTitle}</span>
        </h2>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
          {text.languageSelectLabel}
        </label>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="en">{text.languageEnglish}</option>
          <option value="mr">{text.languageMarathi}</option>
        </select>
      </div>
    </section>
  );
}

export default LanguageSection;
