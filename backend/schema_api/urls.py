from rest_framework.routers import DefaultRouter

from .views import MODEL_ROUTES, viewset_for


router = DefaultRouter()
for route, model in MODEL_ROUTES:
    router.register(route, viewset_for(model), basename=route)

urlpatterns = router.urls
