FROM node:20 AS builder

# Set the timezone environment variable
ENV TZ=Asia/Bangkok

# ตั้งค่า timezone ให้ตรงกับระบบของ host
RUN ln -sf /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
    && echo "Asia/Bangkok" > /etc/timezone

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev) for build process
RUN npm ci

# Copy the rest of the application code to the container
COPY . .

# Build the Next.js app
RUN npm run build

# Start a new stage for production
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Set timezone the same way in production
RUN ln -sf /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
    && echo "Asia/Bangkok" > /etc/timezone

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# แทนที่จะติดตั้ง dependencies ใหม่ คัดลอกจาก stage แรก
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application from the previous stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Expose port 3000
EXPOSE 3000

# Run the Next.js application
CMD ["npm", "start"]
