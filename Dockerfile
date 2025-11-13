FROM node:22 AS build

WORKDIR /app

COPY . .
RUN npm -g i @angular/cli@20 @angular/core@20
RUN npm run build -- --configuration=production

FROM nginx:alpine

COPY --from=build /app/dist/operation-cra/browser /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

