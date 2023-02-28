# Postman Collections to OpenAPI Spec Converter Action

This action converts a Postman Collection to OpenAPI Spec.  

## Inputs

### `myToken`

**Required** The GitHub token to access the repo. {{ secrets.GITHUB_TOKEN }}

## Example usage

```yaml
uses: issc29/postman2openapi-action@main
with:
  myToken: ${{ secrets.GITHUB_TOKEN }}
