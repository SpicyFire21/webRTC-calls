import { io } from "socket.io-client"
import { API_PATH } from '@/configs/api.config.js'

// url du backend, se doit être mis dans un fichier .env en production !
export const socket = io(API_PATH)
console.log(API_PATH)