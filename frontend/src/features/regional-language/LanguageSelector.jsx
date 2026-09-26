import React from 'react';
import { useCaseContext } from '../../CaseContext';

export const LanguageSelector = () => {
  const { language, setLanguage } = useCaseContext();
  return <label className="language-control"><span>Language</span><select value={language} onChange={event => setLanguage(event.target.value)}><option value="en">English</option><option value="hi">हिन्दी</option><option value="mr">मराठी</option></select></label>;
};
