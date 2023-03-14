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

## Protected endpoints
For all these views, `IsAuthenticated` is required. Therefor we only mention the interesting permissions here.
### Building urls
- `building/ - [..., IsAdmin|IsSuperStudent]`
- `building/id - [..., IsAdmin | IsSuperStudent | ReadOnlyStudent | OwnerOfBuilding]`
- `building/owner/id - [..., IsAdmin | IsSuperStudent | OwnerOfBuilding]`
