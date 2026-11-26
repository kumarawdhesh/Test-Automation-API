from rest_framework import serializers


SENSITIVE_FIELDS = {"refresh_token", "password_hash"}


def serializer_for(model):
    extra_kwargs = {
        field.name: {"write_only": True, "required": False}
        for field in model._meta.concrete_fields
        if field.name in SENSITIVE_FIELDS
    }
    meta = type(
        "Meta",
        (),
        {
            "model": model,
            "fields": "__all__",
            "extra_kwargs": extra_kwargs,
        },
    )
    return type(
        "{}Serializer".format(model.__name__),
        (serializers.ModelSerializer,),
        {"Meta": meta},
    )
