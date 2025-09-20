# CI Monitoring Commands (Fixed)

## Check non-successful PR checks
```bash
gh pr checks --json name,state | jq -r '.[] | select(.state != "SUCCESS") | "\(.name): \(.state)"' | sort -u
```

## Group counts by state
```bash
gh pr checks --json name,state | jq -r 'group_by(.state) | map({state: .[0].state, count: length})[]'
```

## Check specific workflow status
```bash
gh run list --workflow=verify-alignment.yml --limit 1 --json status,conclusion,headSha | jq -r '.[] | "\(.headSha[0:7]): \(.status)/\(.conclusion)"'
```

## List recent workflow runs
```bash
gh run list --limit 5 --json workflowName,status,headSha,updatedAt | jq -r '.[] | "\(.headSha[0:7]) \(.status) - \(.workflowName)"'
```

## Get failing checks only
```bash
gh pr checks --json name,state | jq -r '.[] | select(.state == "FAILURE") | .name'
```

## Monitor CI until all pass
```bash
watch -n 10 'gh pr checks --json name,state | jq -r "group_by(.state) | map({state: .[0].state, count: length})[]"'
```