import { useLanguage } from "../../context/LanguageContext";
import settingsLanguage from "../../language/settingsLanguage";
import LanguageSection from "./SettingsSections/LanguageSection";
import CustomerManagement from "./SettingsSections/CustomerManagement";
import MilkRateMaster from "./SettingsSections/MilkRateMaster";
import DairyInformation from "./SettingsSections/DairyInformation";
import PurchaseMilkEntry from "./SettingsSections/PurchaseMilkEntry";
import LogoutSection from "./SettingsSections/LogoutSection";

function Settings() {
  const { language } = useLanguage();
  const text = settingsLanguage[language];

  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light p-4 pb-2 dark:bg-background-dark md:static md:p-6 md:pb-3">
        <div className="flex items-center justify-between md:justify-start">
          <div className="flex items-center gap-2 md:hidden">
            <img
              src="/images/logo.png"
              alt={text.pageTitle}
              className="w-10 h-8"
            />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {text.pageTitle}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pt-0 pb-24 md:p-6 md:pt-0 md:pb-6">
        {/* Language Section */}
        <LanguageSection text={text} />

        {/* Customer Management */}
        <CustomerManagement text={text} />

        {/* Milk Rate Master */}
        <MilkRateMaster text={text} />

        {/* Dairy Information */}
        <DairyInformation text={text} />

        {/* Purchase Milk Entry */}
        <PurchaseMilkEntry text={text} />

        {/* Logout Section */}
        <LogoutSection text={text} />
      </main>
    </>
  );
}

export default Settings;
