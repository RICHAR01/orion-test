# Dockerfile
FROM node:14

# Set an environment variable to unbuffer Python output, aiding in logging and debugging
ENV NODE_ENV=production
ENV MONGO_URL=mongodb://root:5gtIK7Uc6ZaSL5IfmY8LcViNW0uJgc7FkkkDyTys12kdJHASrOuq1tImbi2EPzo3@80.65.211.216:27017/?directConnection=true

# Define an environment variable for the web service's port, commonly used in cloud services
ENV PORT 5000

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run docs

# Inform Docker that the container listens on the specified network port at runtime
EXPOSE ${PORT}

CMD ["npm", "start"]