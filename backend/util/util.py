from datetime import datetime, timedelta


def get_monday_of_current_week(date: datetime) -> datetime:
    """
    Gives you the monday of the week wherein the date resides
    """
    return date - timedelta(days=date.weekday())


def get_sunday_of_current_week(date: datetime) -> datetime:
    """
    Gives you the sunday of the week wherein the date resides
    """
    return date - timedelta(days=date.weekday() + 1) + timedelta(days=6)


def get_saturday_of_current_week(date: datetime) -> datetime:
    """
    Gives you the Saturday of the current week wherein the date resides
    """
    return date + timedelta(days=(5 - date.weekday()))


def get_sunday_of_previous_week(date: datetime) -> datetime:
    """
    Gives you the Sunday of the previous week relative to the given date
    """
    return date - timedelta(days=(date.weekday() + 1))
