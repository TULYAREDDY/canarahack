def check_api_key(request):
    """
    Check if the X-API-Key header matches the expected value.
    This will later be replaced with full OAuth2/mTLS authentication.
    """
    api_key = request.headers.get('X-API-Key')
    return api_key == 'SECRET123' 