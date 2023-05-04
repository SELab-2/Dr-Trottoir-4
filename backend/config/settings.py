"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 4.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""
import collections
from datetime import timedelta
from pathlib import Path

from django.utils.translation import gettext_lazy as _
import os

try:
    from .secrets import DJANGO_SECRET_KEY, SECRET_EMAIL_USER, SECRET_EMAIL_USER_PSWD
except ImportError:
    DJANGO_SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
    SECRET_EMAIL_USER = os.environ.get("SECRET_EMAIL_USER")
    SECRET_EMAIL_USER_PSWD = os.environ.get("SECRET_EMAIL_USER_PSWD")

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

SECRET_KEY = DJANGO_SECRET_KEY

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1", "172.17.0.0"]

# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "django_nose",
]

AUTHENTICATION = [
    "rest_framework.authtoken",
    "allauth",
    "allauth.account",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "rest_framework_simplejwt.token_blacklist",
]

THIRD_PARTY_APPS = AUTHENTICATION + [
    "corsheaders",
    "rest_framework",
    "phonenumber_field",
    "drf_spectacular",
]

CREATED_APPS = ["base"]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + CREATED_APPS

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": ("dj_rest_auth.jwt_auth.JWTCookieAuthentication",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# drf-spectacular settings
# hack to make nose run
# this is needed because a lib was updated
# https://stackoverflow.com/a/70641487
collections.Callable = collections.abc.Callable
# Use nose to run all tests
TEST_RUNNER = "django_nose.NoseTestSuiteRunner"

NOSE_ARGS = ["--cover-xml", "--cover-xml-file=./coverage.xml"]

# drf-spectacular settings
SPECTACULAR_SETTINGS = {
    "TITLE": "Dr-Trottoir API",
    "DESCRIPTION": "This is the documentation for the Dr-Trottoir API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX_INSERT": "/api",
    # OTHER SETTINGS
}

# authentication settings
AUTH_USER_MODEL = "base.User"

REST_AUTH = {
    "SESSION_LOGIN": False,
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": True,
    "JWT_AUTH_SAMESITE": "Strict",
    "JWT_AUTH_COOKIE": "auth-access-token",
    "JWT_AUTH_REFRESH_COOKIE": "auth-refresh-token",
    "USER_DETAILS_SERIALIZER": "base.serializers.UserSerializer",
    "PASSWORD_RESET_SERIALIZER": "authentication.serializers.CustomPasswordResetSerializer",
    "PASSWORD_RESET_USE_SITES_DOMAIN": True,
    "OLD_PASSWORD_FIELD_ENABLED": True,
    "LOGOUT_ON_PASSWORD_CHANGE": False,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5 if not DEBUG else 100),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=14),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "JTI_CLAIM": "jti",
}

AUTHENTICATION_BACKENDS = [
    "allauth.account.auth_backends.AuthenticationBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# 'allauth' settings
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = None
LOGIN_URL = "http://localhost/api/authentication/login"

SITE_ID = 1 if DEBUG else 2

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "config.middleware.CommonMiddlewareAppendSlashWithoutRedirect",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.locale.LocaleMiddleware",
]

LOCALE_PATHS = [
    BASE_DIR / "locale/",
]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:2002",
    "http://localhost:443",
    "http://localhost:80",
    "http://localhost",
]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:2002",
    "http://localhost:443",
    "http://localhost:80",
    "http://localhost",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "drtrottoir",
        "USER": "django",
        "PASSWORD": "password",
        # since testing is run outside the docker, we need a localhost db
        # the postgres docker port is exposed to it should be used as well
        # this 'hack' is just to fix the name resolving of 'web'
        # "HOST": "localhost" if "test" in sys.argv else "web",
        "HOST": "web",
        "PORT": "5432",
    }
}

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/
USE_I18N = True

LANGUAGE_COOKIE_AGE = 3600
LANGUAGE_COOKIE_NAME = "language-cookie"

LANGUAGE_CODE = "nl"

LANGUAGES = [
    ("nl", _("Dutch")),
    ("en", _("English")),
]

TIME_ZONE = "CET"

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_USE_TLS = True
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_HOST_USER = SECRET_EMAIL_USER
EMAIL_HOST_PASSWORD = SECRET_EMAIL_USER_PSWD

# Media
MEDIA_ROOT = "/app/media"
MEDIA_URL = "/media/"

# allow upload big file
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024 * 20  # 20M
FILE_UPLOAD_MAX_MEMORY_SIZE = DATA_UPLOAD_MAX_MEMORY_SIZE


# Used for embedding PDFs
X_FRAME_OPTIONS = "SAMEORIGIN"

