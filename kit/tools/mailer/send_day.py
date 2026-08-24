"""Send one day's email.  python send_day.py <N|next> <to-email> [--dry-run]"""
import json, os, pathlib, smtplib, sys
from datetime import date
from email.message import EmailMessage

HERE = pathlib.Path(__file__).resolve().parent
STATE = HERE / "state.json"


def main(argv):
    dry = "--dry-run" in argv
    args = [a for a in argv if not a.startswith("--")]
    if len(args) != 2:
        sys.exit("usage: send_day.py <N|next> <to-email> [--dry-run]")
    state = json.loads(STATE.read_text()) if STATE.exists() else {"sent": {}}
    day = max((int(k) for k in state["sent"]), default=0) + 1 if args[0] == "next" else int(args[0])
    to = args[1]
    if not 1 <= day <= 10:
        sys.exit(f"day {day} out of range 1-10 (all ten already sent?)")
    if str(day) in state["sent"]:
        sys.exit(f"day {day} already sent on {state['sent'][str(day)]} - refusing to double-send")
    path = HERE / f"day-{day:02d}.md"
    if not path.exists():
        sys.exit(f"{path.name} missing - run make_emails.py first")

    subject, body = path.read_text(encoding="utf-8").split("\n", 1)
    subject = subject.replace("Subject:", "", 1).strip()
    cfg = json.loads((HERE / "config.json").read_text())
    if dry:
        print(f"[dry-run] to={to}  subject={subject}\n---\n{body.strip()[:600]}\n... [{len(body)} chars]")
        return
    pw = os.environ.get(cfg["smtp_password_env"])
    if not pw:
        sys.exit(f"env var {cfg['smtp_password_env']} is not set - see ARM-IT.md")

    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = subject, cfg["smtp_user"], to
    msg.set_content(body.strip() + "\n")
    with smtplib.SMTP(cfg["smtp_host"], cfg["smtp_port"]) as s:
        s.starttls()
        s.login(cfg["smtp_user"], pw)
        s.send_message(msg)
    state["sent"][str(day)] = date.today().isoformat()
    state["last_day"], state["last_sent"] = day, state["sent"][str(day)]
    STATE.write_text(json.dumps(state, indent=2))
    print(f"sent day {day} to {to}")


if __name__ == "__main__":
    main(sys.argv[1:])
