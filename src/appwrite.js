// src/appwrite.js
import { Client, Databases, Query, ID} from 'appwrite';
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DB_ID
const COLLECTION_ID = "metrics"
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID

const client = new Client();
client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID); 

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) =>  {
    //use appwrite sdk to check whether the search term already exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ])  

        console.log("📄 Existing results:", result);

        //if it does, update the count
        if(result.documents.length > 0){
            const doc = result.documents[0];

            console.log("📈 Updating existing count for:", doc.$id);

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {count: doc.count + 1})

            // if it does not , create new document (row) with the search term and the count set to 1
        } else {
            console.log("🆕 Creating new entry for:", searchTerm);
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie["#IMDB_ID"],
                poster_url: movie["#IMG_POSTER"]
            })
        }

    } catch (error) {
        console.log(error)
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])
        return result.documents
    } catch (error) {
        console.log(error)
    }
}