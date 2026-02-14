---
title: "Recipe: AWS S3"
description: "Static hosting on S3 (sync `dist/`)"
last_updated: "2026-02-12"
---

# Recipe: AWS S3

S3 is a solid choice when you're already in AWS.

If you're not already on AWS, Netlify or GitHub Pages is usually faster to get right.

## Prerequisites

- An AWS account
- AWS CLI installed (`aws`)
- A bucket to host your site

## Secrets (important)

If you use access keys locally, keep them out of git and prefer least-privilege IAM.

Minimal IAM policy for deployment (scope to your bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

If you use CloudFront (see below), add:

```json
{
  "Effect": "Allow",
  "Action": "cloudfront:CreateInvalidation",
  "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
}
```

See: [Secrets and Environment Variables](../secrets-and-env-vars.html)

## Build

```bash
make build
```

## Deploy (sync `dist/`)

```bash
aws s3 sync dist/ "s3://$KITFLY_AWS_S3_BUCKET/" --delete
```

Tip: `--delete` keeps the bucket from accumulating old files when pages change names.

## CloudFront (recommended for production)

S3 alone can serve a website, but CloudFront gives you:

- HTTPS with a custom domain (via ACM certificate)
- Global CDN caching
- Better control over headers and redirects

### Basic CloudFront setup shape

1. **Create an ACM certificate** for your domain (must be in `us-east-1` for CloudFront):

   ```bash
   aws acm request-certificate \
     --domain-name docs.example.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Create a CloudFront distribution** with S3 as origin:
   - Origin: your S3 bucket (use the S3 REST endpoint, not the website endpoint)
   - Use Origin Access Control (OAC) so the bucket doesn't need to be public
   - Set default root object: `index.html`
   - Attach your ACM certificate
   - Set alternate domain name: `docs.example.com`

3. **Point DNS** at CloudFront:
   - `docs.example.com` → **CNAME** to your CloudFront distribution domain (`d1234.cloudfront.net`)

4. **Invalidate cache after deploy:**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id "$KITFLY_AWS_CLOUDFRONT_DISTRIBUTION_ID" \
     --paths "/*"
   ```

The CloudFront console and `aws cloudfront create-distribution` CLI have many options. Start simple and add complexity as needed.

## DNS basics (without CloudFront)

If you use S3 website hosting directly (no CloudFront):

- `docs.example.com` → **CNAME** to `YOUR_BUCKET_NAME.s3-website-REGION.amazonaws.com`

Note: S3 website hosting does not support HTTPS on custom domains. For HTTPS, put CloudFront in front.

## About "S3 static website hosting"

AWS has an S3 "website hosting" mode. It works for simple cases, but most teams prefer putting S3 behind CloudFront:

- HTTPS on custom domains
- Global edge caching
- Better security (bucket stays private via OAC)

If you're not sure: start with the simplest approach your org already uses.

## Verify + Rollback

- Verify: load the site, click a few pages, hard refresh, confirm HTTPS lock icon
- Rollback: re-sync the previous build output (or use S3 versioning if you enabled it)

See: [Preflight and Rollback](../preflight.html)
