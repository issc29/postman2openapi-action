# Hello world javascript action

This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

## Inputs

### `myToken`

**Required** The GitHub token to access the repo. {{ secrets.GITHUB_TOKEN }}

## Example usage

```yaml
uses: issc29/postman2openapi-action@main
with:
  myToken: ${{ secrets.GITHUB_TOKEN }}
