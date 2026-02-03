from app.models.transaction import Transaction
from app.models.user import User
from app.models.bin import Bin
import uuid

def handle_deposit(db, user_id, bin_id, waste_type, estimated_value):
    bin_obj = db.query(Bin).filter_by(id=bin_id).first()

    if bin_obj.status != "active":
        return {"error": "Bin unavailable"}

    points = int(estimated_value / 3)

    txn = Transaction(
        id=str(uuid.uuid4()),
        user_id=user_id,
        bin_id=bin_id,
        waste_type=waste_type,
        estimated_value=estimated_value,
        points_earned=points
    )

    db.add(txn)

    db.query(User).filter_by(id=user_id).update(
        {User.points: User.points + points}
    )

    bin_obj.fill_level += 10
    if bin_obj.fill_level >= 90:
        bin_obj.status = "full"

    db.commit()

    return {
        "success": True,
        "points_earned": points,
        "new_fill_level": bin_obj.fill_level
    }
