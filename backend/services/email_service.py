from flask_mail import Message
from app import mail

def send_reset_email(to_email, reset_link):
    msg = Message(
        subject="AgriAdvisor Password Reset",
        recipients=[to_email],
        body=f"""
Hello Farmer,

Click the link below to reset your password:
{reset_link}

This link is valid for 15 minutes.

If you didn’t request this, ignore this email.
"""
    )
    mail.send(msg)
