from typing import Annotated, Union
from gotrue.errors import AuthApiError
from fastapi import FastAPI, UploadFile, HTTPException, Form, Response, Cookie
from supabase import create_client, Client
from dotenv import dotenv_values

SUPABASE_API_URL = dotenv_values(".env")["SUPABASE_API_URL"]
SUPABASE_API_KEY = dotenv_values(".env")["SUPABASE_API_KEY"]
supabase: Client = create_client(SUPABASE_API_URL, SUPABASE_API_KEY)

@app.post("/api/registerUser")
def register_user(
    username: Annotated[str, Form()],
    email: Annotated[str, Form()],
    password: Annotated[str, Form()],
    userType: Annotated[str, Form()],
):
    # TODO: validate sign up form input
    res = supabase.auth.sign_up(
        {
            "email": email,
            "password": password,
            "options": {
                "data": {"username": username, "user_type": userType},
            },
        }
    )
    # TODO: handle errors / empty user data
    response = {
        "user": {
            "id": res.user.id,
            "email": res.user.email,
            "username": res.user.user_metadata.get("username"),
            "userType": res.user.user_metadata.get("user_type"),
            "emailVerified": res.user.email_confirmed_at is not None,
            "createdAt": res.user.created_at,
        }
    }
    return response


@app.post("/api/loginUser")
def login_user(
    email: Annotated[str, Form()], password: Annotated[str, Form()], response: Response
):
    try:
        res = supabase.auth.sign_in_with_password(
            {"email": email, "password": password}
        )
        response.set_cookie(
            key="access_token",
            value=res.session.access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            expires=res.session.expires_at,
        )
        jsonResp = {
            "user": {
                "id": res.user.id,
                "email": res.user.email,
                "username": res.user.user_metadata.get("username"),
                "userType": res.user.user_metadata.get("user_type"),
                "emailVerified": res.user.email_confirmed_at is not None,
                "createdAt": res.user.created_at,
            },
            "session": {
                "access_token": res.session.access_token,
                "refresh_token": res.session.refresh_token,
                "expires_at": res.session.expires_at,
            },
        }
        return jsonResp

    # FIXME: need more robust error handling
    except AuthApiError as e:
        if e.message == "Email not confirmed":
            return {"error": "confirm_email"}
        else:
            raise HTTPException(status_code=400, detail=e.message)


@app.get("/api/fetchUser")
def fetch_user(access_token: Annotated[Union[str, None], Cookie()]):
    try:
        res = supabase.auth.get_user(access_token)
        response = {
            "user": {
                "id": res.user.id,
                "email": res.user.email,
                "username": res.user.user_metadata.get("username"),
                "userType": res.user.user_metadata.get("user_type"),
                "emailVerified": res.user.email_confirmed_at is not None,
                "createdAt": res.user.created_at,
            }
        }
        return response

    # FIXME: need more robust error handling
    except AuthApiError as e:
        if "token is expired" in e.message:
            return {"user": None}
        else:
            raise HTTPException(status_code=400, detail=e.message)


@app.post("/api/logoutUser")
def logout_user(response: Response):
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=0,
    )