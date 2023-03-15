# Authorisation

## Overview

### Role based permissions

- `IsAdmin` (global): checks if the user is an admin
- `IsSuperStudent` (global): checks if the user is a super student
- `IsStudent` (global): checks if the user is a student
- `ReadOnlyStudent` (global): checks if the user is a student and only performs a `GET/HEAD/OPTIONS` request
- `IsSyndic` (global): checks if the user is a syndic

### Object based permissions

- `OwnerOfBuilding` (global + object): checks if the user is a syndic and if he owns the building
- `OwnsAccount` (object): checks if the user tries to access his own user info
- `CanEditUser` (object): checks if the user who tries to edit is in fact the user himself or someone with a higher rank
- `CanEditRole` (object): checks if the user who tries to assign a role, doesn't set a role higher than his own role

## Protected endpoints

For all these views, `IsAuthenticated` is required. Therefor we only mention the interesting permissions here.

### Building urls

- `building/ - [..., IsAdmin|IsSuperStudent]`
- `building/id - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent | OwnerOfBuilding]`
- `building/owner/id - [..., IsAdmin | IsSuperStudent | OwnerOfBuilding]`
- `building/all - [...,IsAdmin | IsSuperStudent]`

### User urls

- `user/ - [..., IsAdmin | IsSuperStudent]`
- `user/id - [..., IsAuthenticated, IsAdmin | IsSuperStudent | OwnsAccount, CanEditUser, CanEditRole]`
- `user/all - [..., IsAdmin | IsSuperStudent]`

### Tour urls

- `tour/ - [..., IsAdmin | IsSuperStudent]`
- `tour/id - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent]`
- `tour/all - [..., IsAdmin | IsSuperStudent]`