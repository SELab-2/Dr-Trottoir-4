from datetime import datetime, timedelta


def get_monday_of_week(date: datetime) -> datetime:
    """
    Gives you the monday of the week wherein the date resides
    """
    return date - timedelta(days=date.weekday())


def get_sunday_of_week(date: datetime) -> datetime:
    """
    Gives you the sunday of the week wherein the date resides
    """
    return date - timedelta(days=date.weekday() + 1) + timedelta(days=6)
