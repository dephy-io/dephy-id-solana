globalThis.__DEV__ = (() => (process as any)['en' + 'v'].NODE_ENV === 'development')();
