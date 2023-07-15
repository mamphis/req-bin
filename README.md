# Request Bin

Request Bin is a basic application which receives Requests and displays them to the user.

New requests will be pushed to the client.

## Installation

### From Github
1. Clone the repository
2. Install NodeJs dependencies `npm install`
3. Build the server and client `npm run build`
4. Copy .env.example to .env `cp .env.example .env`
5. Modify parameters in .env
6. Start the server `node .`

## Configuration
- `PORT` (default: 3000) The port the server will listen to
- `ALLOW_CUSTOM_ROUTES` (default: false) Defines weather custom names for request bins are allowed. Otherwise only internally generated guid will be valid. (These will be created when navigating to the home site)
- `REQUEST_BIN_CACHE_SIZE` (default: 20) The amount of requests that will be cached on the server and send to the client once it connects
- `REQUEST_BIN_INACTIVE_DURATION` (default: 3600000) The duration in milliseconds each Request bin will be available without incoming requests.