import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'zh', 'de'];

export default getRequestConfig(async ({ locale }) => {


    // Handle zh-CN specifically or just ensure we use a supported locale
    let safeLocale = locale;
    if (safeLocale === 'zh-CN') safeLocale = 'zh';

    if (!safeLocale || !locales.includes(safeLocale)) {
        safeLocale = 'en';
    }

    return {
        locale: safeLocale,
        messages: (await import(`../../messages/${safeLocale}.json`)).default
    };
});
