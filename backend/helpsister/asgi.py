"""
ASGI config for helpsister project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

# Ensure DJANGO_SETTINGS_MODULE is set before importing Django-dependent modules
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'helpsister.settings')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

django_asgi_app = get_asgi_application()

# Import chat routing and middleware after Django has been setup
from chat.token_auth_middleware import TokenAuthMiddleware
import chat.routing

application = ProtocolTypeRouter({
	"http": django_asgi_app,
	"websocket": TokenAuthMiddleware(
		URLRouter(
			chat.routing.websocket_urlpatterns
		)
	),
})
