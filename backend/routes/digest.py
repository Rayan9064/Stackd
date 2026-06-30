from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from backend.db import db, ensure_db_connected

router = APIRouter(prefix="/api/digest", tags=["digest"])

class SubscribeRequest(BaseModel):
    email: EmailStr
    geography: Optional[str] = None

@router.post("/subscribe")
async def subscribe(body: SubscribeRequest):
    await ensure_db_connected()
        
    email_clean = body.email.strip().lower()
    geo_clean = body.geography.strip().upper() if body.geography else "GLOBAL"
    
    try:
        # Check if already exists
        subscriber = await db.digestsubscriber.find_unique(
            where={"email": email_clean}
        )
        
        if subscriber:
            if not subscriber.active or subscriber.geography != geo_clean:
                # Re-activate or update subscriber preference
                await db.digestsubscriber.update(
                    where={"email": email_clean},
                    data={"active": True, "geography": geo_clean}
                )
                return {"message": "Subscription preferences updated successfully.", "email": email_clean}
            return {"message": "You are already subscribed to the digest.", "email": email_clean}
            
        # Create new subscriber
        await db.digestsubscriber.create(
            data={
                "email": email_clean,
                "geography": geo_clean,
                "active": True
            }
        )
        return {"message": "Subscribed successfully!", "email": email_clean}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Subscription failed: {str(e)}"
        )
