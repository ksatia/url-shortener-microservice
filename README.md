# API: URL Shortener Microservice

### User Stories

1. I can POST a URL to `[project_url]/api/shorturl/new` and I will receive a shortened URL in the JSON response. Example : `{"original_url":"www.google.com","short_url":1}`
2. If I pass an invalid URL that doesn't follow the valid `http(s)://www.example.com(/more/routes)` format, the JSON response will contain an error like `{"error":"invalid URL"}`.
3. When I visit the shortened URL, it will redirect me to my original link.


#### Creation Example:

POST [project_url]/api/shorturl/new - body (urlencoded) :  url=https://www.google.com

#### Usage:

[this_project_url]/api/shorturl/3

#### Will redirect to:

https://www.google.com

This URL shortener is backed by MongoDB hosted on Atlas. If you clone and run this project locally, you can either set up your own DB connection or just set your MongoDB driver code as an environment variable.

NEXT STEPS

1. Consider a cache layer
2. Allow for custom short links
3. Add link expiration
4. Deeper handling of URLs (query parameters, etc)