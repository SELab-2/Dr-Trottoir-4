from rest_framework.permissions import BasePermission
from rest_framework.permissions import SAFE_METHODS
from base.models import Building


# ----------------------
# ROLE BASED PERMISSIONS
# ----------------------
class IsAdmin(BasePermission):
    """
    Global permission that only grants access to admin users
    """
    message = "Admin permission required"

    def has_permission(self, request, view):
        return request.user.role == 'AD'


class IsSuperStudent(BasePermission):
    """
    Global permission that grants access to super students
    """
    message = "Super student permission required"

    def has_permission(self, request, view):
        return request.user.role == 'SS'


class IsStudent(BasePermission):
    """
    Global permission that grants access to students
    """
    message = "Student permission required"

    def has_permission(self, request, view):
        return request.user.role == 'ST'


class ReadOnlyStudent(BasePermission):
    """
    Global permission that only grants read access for students
    """
    message = "Students are only allowed to read"

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.role == 'ST'


class IsSyndic(BasePermission):
    """
    Global permission that grants access to syndicates
    """
    message = "Syndic permission required"

    def has_permission(self, request, view):
        return request.user.role == 'SY'


# ------------------
# OBJECT PERMISSIONS
# ------------------

class OwnerOfBuilding(BasePermission):
    """
    Checks if the user owns the building
    """
    message = "You can only access the buildings that you own"

    def has_permission(self, request, view):
        return request.user.role == 'SY'

    def has_object_permission(self, request, view, obj: Building):
        return request.user.id == obj.syndic_id
