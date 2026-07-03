import os

import requests


TOKEN_URL = "https://api.producthunt.com/v2/oauth/token"


def main() -> None:
    api_key = os.environ.get("PH_API_KEY")
    api_secret = os.environ.get("PH_API_SECRET")

    if not api_key or not api_secret:
        raise SystemExit(
            "Set PH_API_KEY and PH_API_SECRET before running this script."
        )

    response = requests.post(
        TOKEN_URL,
        json={
            "client_id": api_key,
            "client_secret": api_secret,
            "grant_type": "client_credentials",
        },
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        timeout=30,
    )

    if not response.ok:
        raise SystemExit(
            f"Product Hunt token request failed: {response.status_code} {response.text}"
        )

    try:
        token_data = response.json()
    except ValueError as exc:
        raise SystemExit(
            f"Product Hunt returned a non-JSON response: {response.text[:500]}"
        ) from exc

    access_token = token_data.get("access_token")
    if not access_token:
        raise SystemExit(f"Product Hunt response did not include access_token: {token_data}")

    print(access_token)


if __name__ == "__main__":
    main()
