# 1: Build
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o projeto e gera a pasta 'dist' (padrão do Vite)
COPY . .
RUN npm run build

# 2: Produção
FROM nginx:stable-alpine AS production-stage

# Copia os arquivos gerados no estágio anterior para a pasta do NGINX
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# O NGINX inicia sozinho por padrão na imagem alpine
CMD ["nginx", "-g", "daemon off;"]