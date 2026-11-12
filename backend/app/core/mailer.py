"""SMTP delivery for account security messages. No token is logged or returned."""
import asyncio
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings


def _send(to_email: str, subject: str, body: str) -> None:
    settings = get_settings()
    if not settings.smtp_host or not settings.smtp_from:
        raise RuntimeError("SMTP_HOST and SMTP_FROM must be configured to deliver account emails")
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from
    message["To"] = to_email
    message.set_content(body)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
        server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password or "")
        server.send_message(message)


async def send_action_email(to_email: str, purpose: str, raw_token: str) -> None:
    settings = get_settings()
    if purpose == "verify_email":
        subject = "Verificá tu correo"
        path = "/#/verificar-email"
        intro = "Para confirmar tu dirección de correo, abrí este enlace:"
    elif purpose == "password_reset":
        subject = "Restablecé tu contraseña"
        path = "/#/restablecer-contrasena"
        intro = "Para elegir una nueva contraseña, abrí este enlace:"
    else:
        raise ValueError("Unsupported email action")
    url = f"{settings.frontend_url.rstrip('/')}{path}?token={raw_token}"
    body = f"{intro}\n\n{url}\n\nSi no solicitaste esta acción, ignorá este mensaje."
    await asyncio.to_thread(_send, to_email, subject, body)
