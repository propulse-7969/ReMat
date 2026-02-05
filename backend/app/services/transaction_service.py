from app.models.transaction import Transaction
from app.models.user import User
from app.models.bin import Bin
from app.services.waste_detector import calculate_points
import uuid

def handle_deposit(db, user_id, bin_id, waste_type, base_points, confidence=None, user_override=False):
    bin_obj = db.query(Bin).filter_by(id=bin_id).first()

    if bin_obj.status != "active":
        return {"error": "Bin unavailable"}

    conf = float(confidence) if confidence is not None else 0.0
    points = calculate_points(waste_type, conf, user_override)

    txn = Transaction(
        id=uuid.uuid4(),
        user_id=user_id,
        bin_id=bin_id,
        waste_type=waste_type,
        confidence=confidence,
        points_awarded=points
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
