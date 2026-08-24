# Arm the Double B daily email — 5 steps

Everything is built and tested. Nothing sends until step 5. Do this only after Mike says yes.

## 1. Create a Gmail app password
Google Account -> Security -> 2-Step Verification (must be on) -> App passwords.
Name it "Double B mailer". Google shows a 16-character password once. Copy it.
This is NOT the Gmail login password, and it never goes in any file in this folder.

## 2. Set the environment variable
PowerShell, as Grady, permanent for this user:

    [Environment]::SetEnvironmentVariable("DOUBLEB_SMTP_PASSWORD", "<the 16 chars>", "User")

Close and reopen PowerShell, then confirm it took: `$env:DOUBLEB_SMTP_PASSWORD.Length` -> 16.
(The var name lives in config.json under `smtp_password_env`. The value never does.)

## 3. Put Mike's address in
Nothing to edit — the address is an argument. Just have it ready, e.g. mike@doublebfarmsupply.com.
Check `config.json` sender is right: gradymreisinger@gmail.com.

## 4. Test day 1 to Grady first
    cd <this folder>
    python send_day.py 1 gradymreisinger@gmail.com --dry-run   # prints, sends nothing
    python send_day.py 1 gradymreisinger@gmail.com             # real send, to Grady

Read it on a phone. If it looks right, delete `state.json` so day 1 is free again,
then send it to Mike for real:

    del state.json
    python send_day.py 1 <mike's address>

## 5. Schedule days 2-10 at 7:00am
One task, runs `next` each morning — it reads state.json, sends the day after the last one sent,
and refuses to send a day twice. Run this once (as Grady, from any shell):

    schtasks /Create /TN "DoubleB Daily Email" /SC DAILY /ST 07:00 /RL LIMITED /F ^
      /TR "cmd /c cd /d \"C:\Users\xgmre\Claude\Projects\natty-websites-handoff\clients\double-b-farm-supply\mailer\" && python send_day.py next <mike's address>"

Check it:   `schtasks /Query /TN "DoubleB Daily Email"`
Stop it:    `schtasks /Delete /TN "DoubleB Daily Email" /F`

After day 10 the task exits with "out of range" and mails nothing — safe to leave running,
but delete it anyway once the ten are out.

## Where things stand
- `state.json` is the progress record: which days went out and when. Delete it to reset.
- `day-01.md .. day-10.md` are regenerated any time by `python make_emails.py` (safe, idempotent).
- Scheduled task runs only when the PC is on and Grady is logged in. If a morning is missed,
  nothing is lost — the next run picks up the same next day.
