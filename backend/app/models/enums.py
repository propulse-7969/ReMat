import enum

class PickupStatus(enum.Enum):
    open = "open"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"
