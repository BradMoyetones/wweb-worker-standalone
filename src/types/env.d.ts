declare namespace NodeJS {
    interface ProcessEnv {
        API_URL: string;
        API_LOGIN_URL: string;
        PJD_USER: string;
        PJD_PASS: string;
        HDN: string;
        GROUP_NAME: string;
        START_AT?: string;
        INTERVAL_MINUTES?: string;
    }
}
