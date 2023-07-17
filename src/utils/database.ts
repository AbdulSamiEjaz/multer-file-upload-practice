import mongoose from "mongoose"

export async function connectToMongoDb(url: string) {
  try {
    const conn = await mongoose.connect(url)
    console.log(`Database Connect At: ${conn.connection.host}`)
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
}
