from django.middleware.common import CommonMiddleware


class CommonMiddlewareAppendSlashWithoutRedirect(CommonMiddleware):
    # A request with a slash should have the same meaning as a request without a slash
    # However, Django likes slashes
    # This code adds a slash to URLs without a slash
    def process_request(self, request):
        if not request.path.endswith("/"):
            request.path_info = request.path_info + "/"
