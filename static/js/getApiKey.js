export async function getApiKey() {
    try
    {const apikeyResponse = await fetch("/api-key");
    const apiResult = await apikeyResponse.json();
    const MY_API_KEY = apiResult['api_key'];
    const MY_BEARER_TOKEN = apiResult['bearer_token'];
    return {
        "api-key" : MY_API_KEY,
        "bearer-token": MY_BEARER_TOKEN
    }}
    catch(err) {
        console.error("API key fetch error:", err);
        setErrorMessage("Could not fetch API key :(")
    }
}