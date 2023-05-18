from allauth.account.adapter import get_adapter
from allauth.account.forms import default_token_generator
from allauth.account.utils import user_pk_to_url_str
from dj_rest_auth.forms import AllAuthPasswordResetForm
from django.contrib.sites.models import Site
from django.contrib.sites.shortcuts import get_current_site

import config.settings


class CustomAllAuthPasswordResetForm(AllAuthPasswordResetForm):
    def save(self, request, **kwargs):
        current_site = get_current_site(request)
        email = self.cleaned_data["email"]
        token_generator = kwargs.get("token_generator", default_token_generator)

        for user in self.users:
            temp_key = token_generator.make_token(user)

            host_domain = Site.objects.filter(id=config.settings.SITE_ID).first()
            if not host_domain:
                host_domain = "localhost"
            else:
                host_domain = host_domain.name
            url = host_domain + "/reset-password" + "?uid=" + user_pk_to_url_str(user) + "&token=" + temp_key
            context = {
                "current_site": current_site,
                "user": user,
                "first_name": user.first_name,
                "password_reset_url": url,
                "request": request,
            }
            get_adapter(request).send_mail("account/email/password_reset_key", email, context)
        return self.cleaned_data["email"]
