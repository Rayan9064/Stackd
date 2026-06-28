from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from backend.db import db

router = APIRouter(prefix="/api/digest", tags=["digest"])

class SubscribeRequest(BaseModel):
    email: EmailStr

@router.post("/subscribe")
async def subscribe(body: SubscribeRequest):
    if not db.is_connected():
        await db.connect()
        
    email_clean = body.email.strip().lower()
    
    try:
        # Check if already exists
        subscriber = await db.digestsubscriber.find_unique(
            where={"email": email_clean}
        )
        
        if subscriber:
            if not subscriber.active:
                # Re-activate subscriber
                await db.digestsubscriber.update(
                    where={"email": email_clean},
                    data={"active": True}
                )
                return {"message": "Subscription re-activated successfully.", "email": email_clean}
            return {"message": "You are already subscribed to the digest.", "email": email_clean}
            
        # Create new subscriber
        await db.digestsubscriber.create(
            data={
                "email": email_clean,
                "active": True
            }
        )
        return {"message": "Subscribed successfully!", "email": email_clean}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Subscription failed: {str(e)}"
        )
