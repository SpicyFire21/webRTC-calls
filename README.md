# WebRTC_calls

Projet de test qui implémente les appels avec VueJS et NodeJS


## Lancement du code

### Lancer le frontend

```
npm install

npm run dev -- --host
```
*permet de lancer le code sur le réseau local et donc de tester depuis son téléphone*

### Lancer le bakcend

```
cd api

node server.js
```
*l'api ne pourra pas se lancer car vous devez générer deux fichiers SSL*

voici un exemple de certificat et clé SSL 
```
openssl req -x509 -newkey rsa:2048 -keyout cert.key -out cert.crt -days 365 -nodes -subj "/C=FR/ST=France/L=Paris/O=Dev/CN=localhost"
```