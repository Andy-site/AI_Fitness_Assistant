from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

def generate_password_reset_token(user):
    """
    Generate a unique token for password reset.
    Returns a tuple of (uidb64, token) for use in password reset URL.
    """
    # Create a token generator
    token_generator = PasswordResetTokenGenerator()
    
    # Generate a token for the user
    token = token_generator.make_token(user)
    
    # Encode the user's ID for URL safety
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    
    return {
        'uidb64': uidb64,
        'token': token
    }