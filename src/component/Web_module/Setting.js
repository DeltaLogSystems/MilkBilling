import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import settingsLanguage from "../../language/settingsLanguage";
import CustomerManagement from "./SettingsSections/CustomerManagement";
import DairyInformation from "./SettingsSections/DairyInformation";
import LanguageSection from "./SettingsSections/LanguageSection";
import LogoutSection from "./SettingsSections/LogoutSection";
import MilkRateMaster from "./SettingsSections/MilkRateMaster";
import PurchaseMilkEntry from "./SettingsSections/PurchaseMilkEntry";
import AllowanceSection from "./SettingsSections/AllowanceSection";

function Settings() {
  const { language } = useLanguage();
  const text = settingsLanguage[language];
  const [openSection, setOpenSection] = useState(null);

  const handleToggleSection = (sectionName) => {
    setOpenSection((prev) => (prev === sectionName ? null : sectionName));
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light p-4 pb-2 dark:bg-background-dark md:static md:p-6 md:pb-3">
        <div className="flex items-center justify-between md:justify-start md:hidden">
          <div className="flex items-center w-full  relative">
            {/* Logo on left */}
            <img src="/images/logo.png" alt={text.pageTitle} className="logo" />

            {/* Centered text */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-slate-900 dark:text-white">
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
        <MilkRateMaster
          text={text}
          isOpen={openSection === "milkRate"}
          onToggle={() => handleToggleSection("milkRate")}
        />

        {/* Dairy Information */}
        <DairyInformation
          text={text}
          isOpen={openSection === "dairyInfo"}
          onToggle={() => handleToggleSection("dairyInfo")}
        />

        {/* Purchase Milk Entry */}
        <PurchaseMilkEntry
          text={text}
          isOpen={openSection === "purchase"}
          onToggle={() => handleToggleSection("purchase")}
        />

        {/* Allowance Section */}
        <AllowanceSection
          text={text}
          isOpen={openSection === "allowance"}
          onToggle={() => handleToggleSection("allowance")}
        />

        {/* Logout Section */}
        <LogoutSection text={text} />
      </main>
    </>
  );
}

export default Settings;
