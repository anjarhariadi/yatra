FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY ./prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=deps /app/prisma/generated ./prisma/generated
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma/migrations ./prisma/migrations

# Create uploads directory and public_data volume mount point
RUN mkdir -p /app/public_data

# Environment variables (set at runtime via docker run -e or docker-compose env_file)
# Required:
#   DATABASE_URL=postgresql://yatra:password@db:5432/yatra
#   DIRECT_URL=postgresql://yatra:password@db:5432/yatra  
#   ENCRYPTION_SECRET=your_strong_random_secret
#   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Optional:
#   RESEND_API_KEY=your_resend_key
#   RESEND_FROM=your_verification_email

EXPOSE 3000
CMD ["node", "server.js"]