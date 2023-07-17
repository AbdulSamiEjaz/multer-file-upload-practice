require("dotenv").config()
import multer from "multer"
import config from "config"
import crypto from "crypto"
import express, {
  Response,
  Request,
  ErrorRequestHandler,
  NextFunction,
} from "express"
import { connectToMongoDb } from "./utils/database"

const app = express()
const PORT: number = config.get<number>("PORT") || 7000
const MONGO_URL = process.env.MONGO_URL || ""

//? Single Upload
// const upload = multer({ dest: "uploads/" })
// app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
//   res.json({ sucess: "Uploaded" })
// })

//? Multiple Uploads
// const upload = multer({ dest: "uploads/" })
// app.post("/upload", upload.array("file", 2), (req: Request, res: Response) => {
//   res.json({ sucess: "Uploaded" })
// })

//? Multi Fields Uploads
// const upload = multer({ dest: "uploads/" })
// const multiFieldsUpload = upload.fields([
//   { name: "avatar", maxCount: 1 },
//   { name: "resume", maxCount: 3 },
// ])
// app.post("/upload", multiFieldsUpload, (req: Request, res: Response) => {
//   res.json({ sucess: "Uploaded" })
// })

//? Custom Names for files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/")
//   },
//   filename: (req, file, cb) => {
//     const { originalname } = file
//     cb(null, `${crypto.randomUUID()}-${originalname}`)
//   },
// })
// const upload = multer({ storage })
// app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
//   res.json({ sucess: "Uploaded" })
// })

//? File Validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const { originalname } = file
    cb(null, `${crypto.randomUUID()}-${originalname}`)
  },
})

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true)
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1_000_000_000, files: 3 },
})

app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  res.json({ sucess: "Uploaded" })
})

//? Error handling

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.json({
        message: "File is too large!",
      })
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.json({
        message: "File limit reached!",
      })
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.json({
        message: "File is not an image type!",
      })
    }
  }
})

const server = app.listen(PORT, async () => {
  await connectToMongoDb(MONGO_URL)
  console.log(`🚀 Server started on http://localhost:${PORT}`)
})
