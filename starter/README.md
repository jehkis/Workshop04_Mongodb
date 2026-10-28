# Workshop 04 – Express + MongoDB REST API

Express server with a Mongoose-backed REST API for blog posts and their comments.

## Setup

```bash
cd starter
npm install
cp .env.example .env   # then put your MongoDB connection string in MONGODB_URI
npm run dev            # or: npm start
```

The server starts at `http://localhost:3000` and logs `Connected to MongoDB` once the database is reachable.

## Project structure

```
starter/
├── server.js          # Express app, MongoDB connection, page routes, error handlers
├── models/
│   ├── Post.js        # Post schema: validation, indexes, virtual comments
│   └── Comment.js     # Comment schema referencing a Post
├── routes/
│   └── posts.js       # /api/posts CRUD + comments
└── public/            # Static pages, incl. add-post.html form
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/posts` | Create a post |
| GET    | `/api/posts?page=1&limit=10` | List posts, newest first, paginated |
| GET    | `/api/posts/:id` | Get one post with its comments |
| PUT    | `/api/posts/:id` | Update a post (schema validation applies) |
| DELETE | `/api/posts/:id` | Delete a post and its comments |
| POST   | `/api/posts/:id/comments` | Add a comment to a post |
| GET    | `/api/posts/:id/comments` | List comments of a post |

Post fields: `title` (5–100 chars, required), `description` (min 20 chars, required), `author` (optional, letters only), `tags` (array or comma-separated string), `createdAt` (automatic).

Status codes: `201` created, `200` ok, `400` invalid ID / validation error / invalid JSON, `404` not found, `500` server error. Validation errors are returned as `{ "error": ["message", ...] }`.

### Examples

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Post","description":"This is my first post stored in MongoDB.","author":"Joona"}'

curl "http://localhost:3000/api/posts?page=1&limit=5"
curl http://localhost:3000/api/posts/<id>

curl -X PUT http://localhost:3000/api/posts/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

curl -X POST http://localhost:3000/api/posts/<id>/comments \
  -H "Content-Type: application/json" \
  -d '{"text":"Great post!","author":"Matti"}'

curl -X DELETE http://localhost:3000/api/posts/<id>
```

A browser form for creating posts is available at `http://localhost:3000/add-post`.

## Tasks completed

- **Mandatory 1–5:** connection, schema/model, POST, GET (all + by id), PUT and DELETE
- **Optional 6:** HTML form (`/add-post`) with success/error messages
- **Optional 7:** length rules, custom `author` validator, validation errors returned as 400
- **Optional 8:** indexes on `title` and `createdAt` (plus `post` in comments)
- **Optional 9:** `Comment` model referencing `Post`, loaded with `populate()`
- **Optional 10:** pagination on `GET /api/posts`

MongoDB Introduction learning path: completed – see `../todistus-introduction-to-mongodb.jpg`.
