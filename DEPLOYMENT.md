# Deployment Guide

This guide covers deploying SignalStack to various platforms.

## 🚀 Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications.

### Prerequisites
- GitHub account
- Vercel account
- All required API keys

### Steps

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings

3. **Environment Variables**
   Add these in Vercel dashboard under Settings > Environment Variables:
   
   \`\`\`
   OPENAI_API_KEY=your_openai_api_key
   POLYGON_API_KEY=your_polygon_api_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   FINNHUB_API_KEY=your_finnhub_api_key
   QUIVER_QUANT_API_KEY=your_quiver_quant_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   \`\`\`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Automatic Deployments
- Every push to main branch triggers automatic deployment
- Preview deployments for pull requests
- Rollback capabilities

## 🐳 Docker

Deploy using Docker containers.

### Dockerfile
\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

### Docker Compose
\`\`\`yaml
version: '3.8'
services:
  signalstack:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - POLYGON_API_KEY=${POLYGON_API_KEY}
      - ALPHA_VANTAGE_API_KEY=${ALPHA_VANTAGE_API_KEY}
      - FINNHUB_API_KEY=${FINNHUB_API_KEY}
      - QUIVER_QUANT_API_KEY=${QUIVER_QUANT_API_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
      - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
\`\`\`

## ☁️ AWS

Deploy to AWS using various services.

### AWS Amplify
1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy automatically

### AWS ECS
1. Build Docker image
2. Push to ECR
3. Create ECS service
4. Configure load balancer

## 🔧 Environment Configuration

### Required Variables
- `OPENAI_API_KEY` - OpenAI API key
- `POLYGON_API_KEY` - Polygon.io API key
- `ALPHA_VANTAGE_API_KEY` - Alpha Vantage API key
- `FINNHUB_API_KEY` - Finnhub API key
- `QUIVER_QUANT_API_KEY` - Quiver Quant API key

### Optional Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

### Production Considerations
- Use production API keys
- Enable rate limiting
- Configure monitoring
- Set up error tracking
- Implement health checks

## 📊 Monitoring

### Vercel Analytics
- Built-in performance monitoring
- Real user metrics
- Core Web Vitals tracking

### Custom Monitoring
- API response times
- Error rates
- User engagement
- System health

## 🔒 Security

### API Keys
- Store in environment variables
- Use different keys for production
- Rotate keys regularly
- Monitor usage

### HTTPS
- Automatic HTTPS on Vercel
- Configure SSL certificates
- Redirect HTTP to HTTPS

### Rate Limiting
- Implement API rate limiting
- Monitor for abuse
- Set up alerts

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify environment variables
   - Review build logs

2. **API Errors**
   - Validate API keys
   - Check rate limits
   - Monitor error logs

3. **Performance Issues**
   - Optimize images
   - Implement caching
   - Monitor Core Web Vitals

### Debug Mode
Enable debug logging:
\`\`\`bash
DEBUG=* npm run dev
\`\`\`

## 📈 Scaling

### Horizontal Scaling
- Use serverless functions
- Implement caching
- Optimize database queries

### Performance Optimization
- Image optimization
- Code splitting
- Bundle analysis
- CDN usage

## 🔄 CI/CD

### GitHub Actions
\`\`\`yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
\`\`\`

### Automated Testing
- Unit tests
- Integration tests
- E2E tests
- Performance tests

This deployment guide ensures your SignalStack application runs reliably in production environments.
