# SmartCampus AI - image Docker
# "Recette" de la boite autonome qui contient Node.js + l'app + ses dependances.

# 1. On part d'une image officielle Node.js (version 18, legere "slim")
FROM node:18-slim

# 2. Dossier de travail dans le conteneur
WORKDIR /app

# 3. On copie d'abord les fichiers de dependances (pour profiter du cache Docker :
#    npm install n'est refait que si package.json change)
COPY package*.json ./

# 4. On installe uniquement les dependances de production
RUN npm install --omit=dev

# 5. On copie le reste du code (server.js, src/, public/)
COPY . .

# 6. L'app ecoute sur le port 80 a l'interieur du conteneur
ENV PORT=80
ENV AWS_REGION=us-east-1
EXPOSE 80

# 7. Commande lancee au demarrage du conteneur
CMD ["node", "server.js"]
