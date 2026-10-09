FROM node:22-alpine
WORKDIR /app

# Application Node.js sans dépendances externes (modules natifs uniquement)
COPY . .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
