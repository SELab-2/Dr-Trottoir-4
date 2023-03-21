from rest_framework.permissions import BasePermission
from base.models import Building, User, Role, Manual
from util.request_response_util import request_to_dict

SAFE_METHODS = ["GET", "HEAD", "OPTIONS"]


# ----------------------
# ROLE BASED PERMISSIONS
# ----------------------
class IsAdmin(BasePermission):
    """
    Global permission that only grants access to admin users
    """

    message = "Admin permission required"

    def has_permission(self, request, view):
        return request.user.role.name.lower() == "admin"


class IsSuperStudent(BasePermission):
    """
    Global permission that grants access to super students
    """

    message = "Super student permission required"

    def has_permission(self, request, view):
        return request.user.role.name.lower() == "superstudent"


class IsStudent(BasePermission):
    """
    Global permission that grants access to students
    """

    message = "Student permission required"

    def has_permission(self, request, view):
        return request.user.role.name.lower() == "student"


class ReadOnlyStudent(BasePermission):
    """
    Global permission that only grants read access for students
    """

    message = "Students are only allowed to read"

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.role.name.lower() == "student"


class IsSyndic(BasePermission):
    """
    Global permission that grants access to syndicates
    """

    message = "Syndic permission required"

    def has_permission(self, request, view):
        return request.user.role.name.lower() == "syndic"


# ------------------
# ACTION PERMISSIONS
# ------------------
class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request in SAFE_METHODS


# ------------------
# OBJECT PERMISSIONS
# ------------------


class OwnerOfBuilding(BasePermission):
    """
    Check if the user owns the building
    """

    message = "You can only access/edit the buildings that you own"

    def has_permission(self, request, view):
        return request.user.role.name.lower() == "syndic"

    def has_object_permission(self, request, view, obj: Building):
        return request.user.id == obj.syndic_id


class ReadOnlyOwnerOfBuilding(BasePermission):
    """
    Checks if the user owns the building and only tries to read from it
    """

    message = "You can only read the building that you own"

    def has_permission(self, request, view):
        return request.user.role.name.lower() == "syndic"

    def has_object_permission(self, request, view, obj: Building):
        if request.method in SAFE_METHODS:
            return request.user.id == obj.syndic_id
        return False


class OwnerAccount(BasePermission):
    """
    Checks if the user is owns the user account
    """

    message = "You can only access/edit your own account"

    def has_object_permission(self, request, view, obj: User):
        return request.user.id == obj.id


class ReadOnlyOwnerAccount(BasePermission):
    """
    Checks if the user is owns the user account
    """

    message = "You can only access/edit your own account"

    def has_object_permission(self, request, view, obj: User):
        if request.method in SAFE_METHODS:
            return request.user.id == obj.id
        return False


class CanCreateUser(BasePermission):
    """
    Checks if the user has the right permissions to create the user
    """

    message = "You can't create a user of a higher role"

    def has_object_permission(self, request, view, obj: User):
        if request.method in ["POST"]:
            data = request_to_dict(request.data)
            if "role" in data.keys():
                role_instance = Role.objects.filter(id=data["role"])[0]
                return request.user.role.rank <= role_instance.rank
        return True


class CanDeleteUser(BasePermission):
    """
    Checks if the user has the right permissions to delete a user
    """

    message = "You don't have the right permissions to delete this user"

    def has_object_permission(self, request, view, obj: User):
        if request.method in ["DELETE"]:
            return request.user.role.rank < obj.role.rank
        return True


class CanEditUser(BasePermission):
    """
    Checks if the user has the right permissions to edit
    """

    message = "You don't have the right permissions to edit this user"

    def has_object_permission(self, request, view, obj: User):
        if request.method in ["PATCH"]:
            return request.user.id == obj.id or request.user.role.rank < obj.role.rank
        return True


class CanEditRole(BasePermission):
    """
    Checks if the user has the right permissions to edit the role of a user
    """

    message = "You can't assign a role to yourself or assign a role that is higher than your own"

    def has_object_permission(self, request, view, obj: User):
        if request.method in ["PATCH"]:
            data = request_to_dict(request.data)
            if "role" in data.keys():
                if request.user.id == obj.id:
                    # you aren't allowed to change your own role
                    return False
                role_instance = Role.objects.filter(id=data["role"])[0]
                return request.user.role.rank <= role_instance.rank
        return True


class ManualFromSyndic(BasePermission):
    """
    Checks if the manual belongs to a building from the syndic
    """
    message = "You can only view manuals that are linked to one of your buildings"

    def has_object_permission(self, request, view, obj: Manual):
        return request.user.id == obj.building.syndic_id
