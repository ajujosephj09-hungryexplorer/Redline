# Issue Tracker

Issues for this project are tracked in **GitHub Issues** at https://github.com/ajujosephj09-hungryexplorer/Redline/issues.

## Integration with agent skills

The engineering skills (`to-tickets`, `triage`, `to-spec`, `qa`) read from and write to this tracker using the `gh` CLI. When a skill needs to create an issue, open an issue list, or fetch issue metadata, it calls `gh issue`.

## Pull requests as requests

Pull requests are **not** used as a request surface for agent skills. Work flows through GitHub Issues exclusively.

## Reading the tracker

- Open issues are active work or blocked waiting for information.
- Closed issues are completed or explicitly declined.
- Labels (when `triage` skill is installed) follow the canonical vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.
