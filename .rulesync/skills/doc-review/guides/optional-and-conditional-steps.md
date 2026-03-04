# Optional and Conditional Steps

Format applicability: [All]
IBM Reference: Procedures > Indicating optional and conditional steps
Severity: **Must-fix**

## Rule

### Optional steps
- Begin with **"Optional:"** (with colon).
- If the optional step has benefits worth emphasizing, format it as a conditional step using "if" or "when".

### Conditional steps
- Begin with **"If"** or state the constraint first.

## Examples

### Optional steps

| DON'T | DO |
|---|---|
| You can optionally tune the frequency. | Optional: Tune the frequency when you redeploy the overcloud. |
| Reload the systemd daemon. Optionally, verify the new timeout value. | Reload the systemd daemon. Optional: Verify the new timeout value. |

### Conditional steps

| DON'T | DO |
|---|---|
| Refresh the page if your Internet connection drops. | If your Internet connection drops before the transfer is complete, refresh the download page. |
| For master repositories: In the IP address field, type the IP address. | Master repository only: In the IP address field, type the IP address. |
