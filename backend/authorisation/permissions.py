from rest_framework import permissions

from base.models import Building


# ----------------------
# ROLE BASED PERMISSIONS
# ----------------------
class IsAdmin(permissions.BasePermission):
    """
    Global permission that only grants access to admin users
    """
    message = "Admin permission required"

    def has_permission(self, request, view):
        return request.user.role == 'AD'


class IsSuperStudent(permissions.BasePermission):
    """
    Global permission that grants access to super students
    """
    message = "Super student permission required"

    def has_permission(self, request, view):
        return request.user.role == 'SS'


class IsStudent(permissions.BasePermission):
    """
    Global permission that grants access to students
    """
    message = "Student permission required"

    def has_permission(self, request, view):
        return request.user.role == 'ST'


class IsSyndic(permissions.BasePermission):
    """
    Global permission that grants access to syndicates
    """
    message = "Syndic permission required"

    def has_permission(self, request, view):
        return request.user.role == 'SY'


# ------------------
# OBJECT PERMISSIONS
# ------------------

class OwnsBuilding(permissions.BasePermission):
    """
    Checks if the user owns the building
    """
    message = "You must be the owner of the building to be able to perform this request"

    def has_object_permission(self, request, view, obj: Building):
        return request.user.id == obj.syndic
