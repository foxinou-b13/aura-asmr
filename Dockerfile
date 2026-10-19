# Image Docker du bot (déploiement professionnel)
FROM node:20-slim

WORKDIR /app

# Installation des dépendances
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Code du bot
COPY . .

# Le bot écoute sur le port fourni par la plateforme (ou 3000 par défaut)
ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]
