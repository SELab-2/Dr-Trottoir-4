from datetime import datetime, timedelta


def get_monday_of_week(date_str) -> datetime:
    """
    Gives you the monday of the week wherein the date resides
    """
    date = datetime.strptime(date_str, "%Y-%m-%d")
    return date - timedelta(days=date.weekday())


def get_sunday_of_week(date_str: str) -> datetime:
    """
    Gives you the sunday of the week wherein the date resides
    """
    date = datetime.strptime(date_str, "%Y-%m-%d")
    return date - timedelta(days=date.weekday() + 1) + timedelta(days=6)
