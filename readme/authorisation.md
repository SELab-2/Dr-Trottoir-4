# Authorisation

## Overview

### Role based permissions

- `IsAdmin` (global): checks if the user is an admin
- `IsSuperStudent` (global): checks if the user is a super student
- `IsStudent` (global): checks if the user is a student
- `ReadOnlyStudent` (global): checks if the user is a student and only performs a `GET/HEAD/OPTIONS` request
- `IsSyndic` (global): checks if the user is a syndic

### Object based permissions

- `OwnerOfBuilding` (global + object): checks if the user is a syndic and if he is the owner
- `ReadOnlyOwnerOfBuilding` (global + object): checks if the user is a syndic and if he owns the building and only tries
  to read from it
- `OwnerAccount` (object): checks if the user tries to access his own user info or info that belongs to him/her
- `ReadOnlyOwnerAccount` (object): checks if the user tries to read his own user info or info that belongs to him/her
- `CanCreateUser` (object): checks if the user only creates users of higher or equal rank
- `CanDeleteUser` (object): checks if the user has a higher rank than the one he tries to delete
- `CanEditUser` (object): checks if the user who tries to edit is in fact the user himself or someone with a higher rank
- `CanEditRole` (object): checks if the user who tries to assign a role, doesn't set a role higher than his own role
- `ManualFromSyndic` (object): checks if the user that tries to access the manual is in fact the owner of the
  building for which this manual was uploaded.

### Action based permissions

- `ReadOnly` (global): checks if the method is a safe method (`GET`, `HEAD`, `OPTIONS`)

## Protected endpoints

For all these views, `IsAuthenticated` is required. Therefor we only mention the interesting permissions here.

### Building urls

- `building/ - [..., IsAdmin|IsSuperStudent]`
- `building/id - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent | ReadOnlyOwnerOfBuilding]`
- `building/owner/id - [..., IsAdmin | IsSuperStudent | ReadOnlyOwnerOfBuilding]`
- `building/all - [...,IsAdmin | IsSuperStudent]`

### BuildingComment urls

- `building/ - [..., IsAdmin | IsSuperStudent | OwnerOfBuildin]`
- `building/comment_id - [..., IsAdmin | IsSuperStudent | OwnerOfBuilding | ReadOnlyStudent]`
- `building/building_id - [..., IsAdmin | IsSuperStudent | OwnerOfBuilding | ReadOnlyStudent]`

### BuildingOnTour urls

- `building_on_tour/ - [...,IsAdmin | IsSuperStudent]`
- `building_on_tour/id - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent]`
- `building_on_tour/all - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent]`

### BuildingUrls urls

- `buildingurl/ - [..., IsAdmin | OwnerOfBuilding]`
- `buildingurl/id - [..., IsAdmin | OwnerOfBuilding]`
- `buildingurl/syndic/id - [..., IsAdmin | OwnerAccount]`
- `buildingurl/building/id - [..., IsAdmin | OwnerOfBuilding]`
- `buildingurl/all - [..., IsAdmin]`

### Garbage Collection

- `garbage_collection/ - [..., IsAdmin | IsSuperStudent]`
- `garbage_collection/id - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent]`
- `garbage_collection/building/id - [IsAdmin | IsSuperStudent | ReadOnlyStudent | ReadOnlyOwnerOfBuilding]`
- `garbage_collection/all - [..., IsAdmin | IsSuperStudent]`

### Manual

- `manual/ - [..., IsAdmin | IsSuperStudent | IsSyndic]`
- `manual/id - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent | ManualFromSyndic]`
- `manual/building/id - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent | OwnerOfBuilding]`
- `manual/all/ - [..., IsAdmin | IsSuperStudent]`

### PictureBuilding

- `picture_building/ - [..., IsAdmin | IsSuperStudent | IsStudent]`
- `picture_building/id - [..., IsAdmin | IsSuperStudent | IsStudent | ReadOnlyOwnerOfBuilding]`
- `picture_building/building/id - [..., IsAdmin | IsSuperStudent | IsStudent | ReadOnlyOwnerOfBuilding]`
- `picture_building/all - [..., IsAdmin | IsSuperStudent]`

### Region

- `region/ - [..., IsAdmin]`
- `region/id - [..., IsAdmin | ReadOnly]`
- `region/all - [..., IsAdmin | IsSuperStudent | IsStudent]`

### Role

- `role/ - [..., IsAdmin]`
- `role/id - [..., IsAdmin | IsSuperStudent]`
- `role/all - [..., IsAdmin | IsSuperStudent]`

### Student at building on tour

- `student_at_building_on_tour/ - [..., IsAdmin | IsSuperStudent]`
- `student_at_building_on_tour/id - [..., IsAdmin | IsSuperStudent | ReadOnlyOwnerAccount]`
- `student_at_building_on_tour/student/id - [..., IsAdmin | IsSuperStudent | OwnerAccount]`
- `student_at_building_on_tour/all - [..., IsAdmin | IsSuperStudent]`

### Tour urls

- `tour/ - [..., IsAdmin | IsSuperStudent]`
- `tour/id - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent]`
- `tour/all - [..., IsAdmin | IsSuperStudent]`

### User urls

- `user/ - [..., IsAdmin | IsSuperStudent, CanCreateUser]`
- `user/id - [..., IsAuthenticated, IsAdmin | IsSuperStudent | OwnerAccount, CanEditUser, CanEditRole, CanDeleteUser]`
- `user/all - [..., IsAdmin | IsSuperStudent]`