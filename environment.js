let environment;
let redirectURL;

// Determine environment from process.env
if (import.meta.env.VITE_REACT_APP_ENV === "local") {
    environment = "local";
    redirectURL = "http://localhost:1234/"

} else if (import.meta.env.VITE_REACT_APP_ENV === "dev") {
    environment = "dev";
    redirectURL = "https://dev.falcon.ea.com/"

} else if (import.meta.env.VITE_REACT_APP_ENV === "feature") {
    environment = "feature";
    redirectURL = "https://feature.falcon.ea.com/"

} else if (import.meta.env.VITE_REACT_APP_ENV === "prod") {
    environment = "prod";
    redirectURL = "https://falcon.ea.com/"

} else {
    console.warn("Unknown environment, defaulting to 'local'");
    environment = "local";
    redirectURL = "http://localhost:1234/"
}

// Define environment-specific URLs
let FALCON_API_LOCAL, FALCON_LOGOUT_URL_LOCAL, FALCON_LOGIN_URL_CODE_LOCAL, FALCON_LITE_LOGIN_URL_CODE_LOCAL, GUARDIAN_API_LOCAL;

if (environment === "local") {
    FALCON_API_LOCAL = "https://fxb9qrw70c-vpce-0bb8263658427e87f.execute-api.us-west-2.amazonaws.com/feature";
    FALCON_LOGIN_URL_CODE_LOCAL = `https://falcon-developer.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=30mur608t708n9kvsep7cla53c&response_type=code&scope=email+openid+profile&redirect_uri=${redirectURL}authcallback`;
    FALCON_LOGOUT_URL_LOCAL = `https://panomath-okta-test.auth.us-west-2.amazoncognito.com/logout?client_id=76bqnnqb93f70jjohejvlidnc0&logout_uri=${redirectURL}logout`;
    FALCON_LITE_LOGIN_URL_CODE_LOCAL = `https://falcon-developer.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=30mur608t708n9kvsep7cla53c&response_type=code&scope=email+openid+profile&redirect_uri=${redirectURL}falcon-lite/nexus/authcallback`;
    GUARDIAN_API_LOCAL = "https://dc01otsag1-vpce-0d5a016a3cacf9612.execute-api.us-west-2.amazonaws.com/SIT/guardian-application-integration/user-connection-details?operation=fetch_connection_names&appName=Falcon_Dev";

} else if (environment === "feature") {
    FALCON_API_LOCAL = "https://fxb9qrw70c-vpce-0bb8263658427e87f.execute-api.us-west-2.amazonaws.com/feature";
    FALCON_LOGIN_URL_CODE_LOCAL = `https://falcon-developer.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=30mur608t708n9kvsep7cla53c&response_type=code&scope=email+openid+profile&redirect_uri=${redirectURL}authcallback`;
    FALCON_LOGOUT_URL_LOCAL = `https://panomath-okta-test.auth.us-west-2.amazoncognito.com/logout?client_id=76bqnnqb93f70jjohejvlidnc0&logout_uri=${redirectURL}logout`;
    FALCON_LITE_LOGIN_URL_CODE_LOCAL = `https://falcon-developer.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=30mur608t708n9kvsep7cla53c&response_type=code&scope=email+openid+profile&redirect_uri=${redirectURL}falcon-lite/nexus/authcallback`;
    GUARDIAN_API_LOCAL = "https://dc01otsag1-vpce-0d5a016a3cacf9612.execute-api.us-west-2.amazonaws.com/SIT/guardian-application-integration/user-connection-details?operation=fetch_connection_names&appName=Falcon_Dev";

} else if (environment === "dev") {
    FALCON_API_LOCAL = "https://0rmoz432yc-vpce-08c758cf0cc9a1ccc.execute-api.us-west-2.amazonaws.com/dev";
    FALCON_LOGIN_URL_CODE_LOCAL = `https://falcon-developer.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=30mur608t708n9kvsep7cla53c&response_type=code&scope=email+openid+profile&redirect_uri=${redirectURL}authcallback`;
    FALCON_LOGOUT_URL_LOCAL = `https://panomath-okta-test.auth.us-west-2.amazoncognito.com/logout?client_id=76bqnnqb93f70jjohejvlidnc0&logout_uri=${redirectURL}logout`;
    FALCON_LITE_LOGIN_URL_CODE_LOCAL = `https://falcon-developer.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=30mur608t708n9kvsep7cla53c&response_type=code&scope=email+openid+profile&redirect_uri=${redirectURL}falcon-lite/nexus/authcallback`;
    GUARDIAN_API_LOCAL = "https://dc01otsag1-vpce-0d5a016a3cacf9612.execute-api.us-west-2.amazonaws.com/SIT/guardian-application-integration/user-connection-details?operation=fetch_connection_names&appName=Falcon_Dev";

} else if (environment === "prod") {
    FALCON_API_LOCAL = "https://mbsu395k15-vpce-0aea7ebd142120b86.execute-api.us-west-2.amazonaws.com/prod";
    FALCON_LOGIN_URL_CODE_LOCAL = `https://falcon-production.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=3daa74roe9u0flpjgcrdeust7t&response_type=code&scope=email+openid+profile&redirect_uri=${redirectURL}authcallback`;
    FALCON_LOGOUT_URL_LOCAL = `https://falcon-production.auth.us-west-2.amazoncognito.com/logout?client_id=3daa74roe9u0flpjgcrdeust7t&logout_uri=${redirectURL}logout`;
    FALCON_LITE_LOGIN_URL_CODE_LOCAL = `https://falcon-production.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=3daa74roe9u0flpjgcrdeust7t&response_type=code&scope=email+openid+profile&redirect_uri=${redirectURL}falcon-lite/nexus/authcallback`;
    GUARDIAN_API_LOCAL = "https://dc01otsag1-vpce-0d5a016a3cacf9612.execute-api.us-west-2.amazonaws.com/SIT/guardian-application-integration/user-connection-details?operation=fetch_connection_names&appName=Falcon"

}

export const FALCON_LOGIN_URL_CODE = FALCON_LOGIN_URL_CODE_LOCAL;
export const FALCON_LITE_LOGIN_URL_CODE = FALCON_LITE_LOGIN_URL_CODE_LOCAL;
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const FALCON_API = configuredApiBaseUrl
    ? configuredApiBaseUrl.replace(/\/+$/, "")
    : FALCON_API_LOCAL;
export const LOCAL_API_MODE = import.meta.env.DEV && import.meta.env.VITE_LOCAL_API_MODE === "true";
export const GUARDIAN_API = import.meta.env.VITE_GUARDIAN_API_URL
    || (configuredApiBaseUrl
        ? `${FALCON_API}/guardian-connections?operation=fetch_connection_names&appName=Falcon_Dev`
        : GUARDIAN_API_LOCAL);
export const FALCON_LOGOUT_URL = FALCON_LOGOUT_URL_LOCAL;
export const FALCON_ENV = environment;
export const REDIRECT_URL = redirectURL;
export const DEMO_MODE = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === "true";
export const CREATORS = ['mgurunathan@contractor.ea.com', 'saj@contractor.ea.com', 'saketha@ea.com', 'ramkumar@contractor.ea.com', 'nkesavarapu@contractor.ea.com', 'spolamarasetti@ea.com'];
