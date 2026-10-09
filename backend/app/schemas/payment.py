from pydantic import BaseModel


class PaymentCreate(BaseModel):
    order_id: int


class PaymentCreateResponse(BaseModel):
    order_id: int
    app_id: str              # public app id, safe to send to the browser
    payment_session_id: str
    cf_order_id: str
    amount: float
    currency: str
    env: str                 # "sandbox" or "production", tells the SDK which mode to load