import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
    console.log('i18n request locale:', locale);
    const safeLocale = locale || 'en';
    return {
        locale: safeLocale,
        messages: (await import(`../../messages/${safeLocale}.json`)).default
    };
});
