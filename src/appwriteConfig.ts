// src/appwrite.js
import { Client, Account, Databases , Storage} from 'appwrite';

const client = new Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("685696ae00002c87c470"); // Replace with your Project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client); 
export default client;
